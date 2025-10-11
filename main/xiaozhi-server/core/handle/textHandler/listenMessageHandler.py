import time
from typing import Dict, Any

from core.handle.receiveAudioHandle import handleAudioMessage, startToChat
from core.providers.tts.dto.dto import TTSMessageDTO, SentenceType, ContentType
from core.handle.reportHandle import enqueue_asr_report
from core.handle.sendAudioHandle import send_stt_message, send_tts_message
from core.handle.textMessageHandler import TextMessageHandler
from core.handle.textMessageType import TextMessageType
from core.utils.util import remove_punctuation_and_length

TAG = __name__

class ListenTextMessageHandler(TextMessageHandler):
    """Listen消息处理器"""

    @property
    def message_type(self) -> TextMessageType:
        return TextMessageType.LISTEN

    async def handle(self, conn, msg_json: Dict[str, Any]) -> None:
        if "mode" in msg_json:
            conn.client_listen_mode = msg_json["mode"]
            conn.logger.bind(tag=TAG).debug(
                f"客户端拾音模式：{conn.client_listen_mode}"
            )
        if msg_json["state"] == "start":
            conn.client_have_voice = True
            conn.client_voice_stop = False
        elif msg_json["state"] == "stop":
            conn.client_have_voice = True
            conn.client_voice_stop = True
            if len(conn.asr_audio) > 0:
                await handleAudioMessage(conn, b"")
        elif msg_json["state"] == "detect":
            conn.client_have_voice = False
            conn.asr_audio.clear()
            if "text" in msg_json:
                conn.last_activity_time = time.time() * 1000
                original_text = msg_json["text"]  # 保留原始文本
                filtered_len, filtered_text = remove_punctuation_and_length(
                    original_text
                )

                # 识别是否是唤醒词
                is_wakeup_words = filtered_text in conn.config.get("wakeup_words")
                # 配置的唤醒词问候语（默认：嘿，你好呀），无条件触发 TTS 合成
                greeting_conf = conn.config.get("greeting", {}) or {}

                if is_wakeup_words:
                    greeting_text = greeting_conf.get("prompt") or "嘿，你好呀"
                    conn.just_woken_up = True
                    # STT 显示用户原始唤醒词
                    await send_stt_message(conn, original_text)
                    # 上报纯文字数据（ASR 上报用原始唤醒词）
                    enqueue_asr_report(conn, original_text, [])
                    # 独立于LLM的问候合成，补齐 FIRST/LAST，避免卡在说话中
                    conn.llm_finish_task = True
                    conn.sentence_id = __import__("uuid").uuid4().hex
                    conn.tts.tts_text_queue.put(
                        TTSMessageDTO(
                            sentence_id=conn.sentence_id,
                            sentence_type=SentenceType.FIRST,
                            content_type=ContentType.ACTION,
                        )
                    )
                    conn.tts.tts_one_sentence(conn, ContentType.TEXT, content_detail=greeting_text)
                    conn.tts.tts_text_queue.put(
                        TTSMessageDTO(
                            sentence_id=conn.sentence_id,
                            sentence_type=SentenceType.LAST,
                            content_type=ContentType.ACTION,
                        )
                    )
                else:
                    # 上报纯文字数据（复用ASR上报功能，但不提供音频数据）
                    enqueue_asr_report(conn, original_text, [])
                    # 否则需要LLM对文字内容进行答复
                    await startToChat(conn, original_text)
