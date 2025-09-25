import time
import json
import random
import asyncio
from urllib.parse import urlparse
from core.utils.dialogue import Message
from core.utils.util import audio_to_data
from core.providers.tts.dto.dto import SentenceType
from core.utils.wakeup_word import WakeupWordsConfig
from core.handle.sendAudioHandle import sendAudioMessage, send_stt_message
from core.utils.util import (
    remove_punctuation_and_length,
    opus_datas_to_wav_bytes,
    get_local_ip,
)
from core.providers.tools.device_mcp import (
    MCPClient,
    send_mcp_initialize_message,
    send_mcp_tools_list_request,
)

TAG = __name__

WAKEUP_CONFIG = {
    "refresh_time": 5,
    "words": ["你好", "你好啊", "嘿，你好", "嗨"],
}

# 创建全局的唤醒词配置管理器
wakeup_words_config = WakeupWordsConfig()

# 用于防止并发调用wakeupWordsResponse的锁
_wakeup_response_lock = asyncio.Lock()


async def handleHelloMessage(conn, msg_json):
    """处理hello消息"""
    audio_params = msg_json.get("audio_params")
    if audio_params:
        format = audio_params.get("format")
        conn.logger.bind(tag=TAG).info(f"客户端音频格式: {format}")
        conn.audio_format = format
        conn.welcome_msg["audio_params"] = audio_params
    features = msg_json.get("features")
    if features:
        conn.logger.bind(tag=TAG).info(f"客户端特性: {features}")
        conn.features = features
        if features.get("mcp"):
            conn.logger.bind(tag=TAG).info("客户端支持MCP")
            conn.mcp_client = MCPClient()
            # 发送初始化
            asyncio.create_task(send_mcp_initialize_message(conn))
            # 发送mcp消息，获取tools列表
            asyncio.create_task(send_mcp_tools_list_request(conn))

    # 服务器在hello时附带必要的环境信息与情绪资源地址
    try:
        server_cfg = conn.config.get("server", {})

        # 计算 websocket 地址
        ws_port = int(server_cfg.get("port", 8000))
        ws_cfg = server_cfg.get("websocket", "")
        if ws_cfg and ("你" not in ws_cfg):
            websocket_url = ws_cfg
        else:
            websocket_url = f"ws://{get_local_ip()}:{ws_port}/xiaozhi/v1/"

        # 提取客户端携带的token（如有）
        token = None
        if isinstance(conn.headers, dict):
            auth_header = conn.headers.get("authorization") or conn.headers.get(
                "Authorization"
            )
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ", 1)[1]

        # 计算 emotion_url（优先使用 vision_explain 的域名与协议，其次回落至本机 http_port）
        emotion_url = ""
        vision_explain = server_cfg.get("vision_explain", "")
        if vision_explain and ("你" not in vision_explain):
            parsed = urlparse(vision_explain)
            if parsed.scheme and parsed.netloc:
                emotion_url = f"{parsed.scheme}://{parsed.netloc}/xiaozhi/emotions"
        if not emotion_url:
            http_port = int(server_cfg.get("http_port", 8003))
            emotion_url = f"http://{get_local_ip()}:{http_port}/xiaozhi/emotions"

        # 附加字段到欢迎包
        conn.welcome_msg["websocket"] = (
            {"url": websocket_url, "token": token} if token else {"url": websocket_url}
        )
        conn.welcome_msg["server_time"] = {
            "timestamp": int(round(time.time() * 1000)),
            "timezone_offset": server_cfg.get("timezone_offset", 8) * 60,
        }
        # 固件信息（hello阶段通常无版本信息，保持空值占位以兼容固件解析）
        conn.welcome_msg["firmware"] = {"version": "", "url": ""}
        # 表情资源列表获取地址
        conn.welcome_msg["emotion_url"] = emotion_url
    except Exception:
        # 兜底：任何异常都不影响hello基本返回
        pass

    await conn.websocket.send(json.dumps(conn.welcome_msg))


async def checkWakeupWords(conn, text):
    enable_wakeup_words_response_cache = conn.config[
        "enable_wakeup_words_response_cache"
    ]

    # 等待tts初始化，最多等待3秒
    start_time = time.time()
    while time.time() - start_time < 3:
        if conn.tts:
            break
        await asyncio.sleep(0.1)
    else:
        return False

    if not enable_wakeup_words_response_cache:
        return False

    _, filtered_text = remove_punctuation_and_length(text)
    if filtered_text not in conn.config.get("wakeup_words"):
        return False

    conn.just_woken_up = True
    await send_stt_message(conn, text)

    # 获取当前音色
    voice = getattr(conn.tts, "voice", "default")
    if not voice:
        voice = "default"

    # 获取唤醒词回复配置
    response = wakeup_words_config.get_wakeup_response(voice)
    if not response or not response.get("file_path"):
        response = {
            "voice": "default",
            "file_path": "config/assets/wakeup_words.wav",
            "time": 0,
            "text": "哈啰啊，我是小智啦，声音好听的台湾女孩一枚，超开心认识你耶，最近在忙啥，别忘了给我来点有趣的料哦，我超爱听八卦的啦",
        }

    # 获取音频数据
    opus_packets = audio_to_data(response.get("file_path"))
    # 播放唤醒词回复
    conn.client_abort = False

    conn.logger.bind(tag=TAG).info(f"播放唤醒词回复: {response.get('text')}")
    await sendAudioMessage(conn, SentenceType.FIRST, opus_packets, response.get("text"))
    await sendAudioMessage(conn, SentenceType.LAST, [], None)

    # 补充对话
    conn.dialogue.put(Message(role="assistant", content=response.get("text")))

    # 检查是否需要更新唤醒词回复
    if time.time() - response.get("time", 0) > WAKEUP_CONFIG["refresh_time"]:
        if not _wakeup_response_lock.locked():
            asyncio.create_task(wakeupWordsResponse(conn))
    return True


async def wakeupWordsResponse(conn):
    if not conn.tts or not conn.llm or not conn.llm.response_no_stream:
        return

    try:
        # 尝试获取锁，如果获取不到就返回
        if not await _wakeup_response_lock.acquire():
            return

        # 生成唤醒词回复
        wakeup_word = random.choice(WAKEUP_CONFIG["words"])
        question = (
            "此刻用户正在和你说```"
            + wakeup_word
            + "```。\n请你根据以上用户的内容进行20-30字回复。要符合系统设置的角色情感和态度，不要像机器人一样说话。\n"
            + "请勿对这条内容本身进行任何解释和回应，请勿返回表情符号，仅返回对用户的内容的回复。"
        )

        result = conn.llm.response_no_stream(conn.config["prompt"], question)
        if not result or len(result) == 0:
            return

        # 生成TTS音频
        tts_result = await asyncio.to_thread(conn.tts.to_tts, result)
        if not tts_result:
            return

        # 获取当前音色
        voice = getattr(conn.tts, "voice", "default")

        wav_bytes = opus_datas_to_wav_bytes(tts_result, sample_rate=16000)
        file_path = wakeup_words_config.generate_file_path(voice)
        with open(file_path, "wb") as f:
            f.write(wav_bytes)
        # 更新配置
        wakeup_words_config.update_wakeup_response(voice, file_path, result)
    finally:
        # 确保在任何情况下都释放锁
        if _wakeup_response_lock.locked():
            _wakeup_response_lock.release()
