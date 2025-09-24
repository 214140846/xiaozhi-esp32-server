from aiohttp import web
from typing import List, Dict

from config.logger import setup_logging
from config.manage_api_client import ManageApiClient, init_service


DEFAULT_EMOTIONS: List[Dict] = [
    {"id": "emote_neutral001", "emoji": "😶", "code": "neutral"},
    {"id": "emote_happy002", "emoji": "🙂", "code": "happy"},
    {"id": "emote_laughing003", "emoji": "😆", "code": "laughing"},
    {"id": "emote_funny004", "emoji": "😂", "code": "funny"},
    {"id": "emote_sad005", "emoji": "😔", "code": "sad"},
    {"id": "emote_angry006", "emoji": "😠", "code": "angry"},
    {"id": "emote_crying007", "emoji": "😭", "code": "crying"},
    {"id": "emote_loving008", "emoji": "😍", "code": "loving"},
    {"id": "emote_embarrassed009", "emoji": "😳", "code": "embarrassed"},
    {"id": "emote_surprised010", "emoji": "😯", "code": "surprised"},
    {"id": "emote_shocked011", "emoji": "😱", "code": "shocked"},
    {"id": "emote_thinking012", "emoji": "🤔", "code": "thinking"},
    {"id": "emote_winking013", "emoji": "😉", "code": "winking"},
    {"id": "emote_cool014", "emoji": "😎", "code": "cool"},
    {"id": "emote_relaxed015", "emoji": "😌", "code": "relaxed"},
    {"id": "emote_delicious016", "emoji": "😋", "code": "delicious"},
    {"id": "emote_kissy017", "emoji": "😘", "code": "kissy"},
    {"id": "emote_confident018", "emoji": "😏", "code": "confident"},
    {"id": "emote_sleepy019", "emoji": "😴", "code": "sleepy"},
    {"id": "emote_silly020", "emoji": "😜", "code": "silly"},
    {"id": "emote_confused021", "emoji": "🙄", "code": "confused"},
]


class EmotionHandler:
    def __init__(self, config: dict):
        self.config = config
        self.logger = setup_logging()

    async def handle_get(self, request: web.Request) -> web.Response:
        mac = request.query.get("mac") or request.headers.get("mac-address")
        if not mac:
            return web.json_response({"code": 1, "msg": "missing mac"}, status=400)

        # 确保已初始化 manager-api 客户端（即使未启用“从API读取配置”也可用）
        if getattr(ManageApiClient, "_instance", None) is None:
            try:
                init_service(self.config)
            except Exception as e:
                self.logger.warning(f"init manage api client failed: {e}")

        overrides: List[Dict] = []
        try:
            # 通过 manager-api 拉取该设备对应智能体配置的表情资源
            overrides = ManageApiClient._instance._execute_request(
                "GET", "/emotion/list/by-mac", params={"mac": mac}
            ) or []
        except Exception as e:
            self.logger.warning(f"get emotions by mac failed: {e}")

        # 归一化下载URL，输出绝对地址（设备可直接下载）
        def normalize_url(u: str) -> str:
            if not u:
                return ""
            if u.startswith("http://") or u.startswith("https://"):
                return u
            # 优先用 ManageApiClient 初始化的 base_url，否则退回配置
            base = getattr(ManageApiClient, "config", None)
            base_url = ""
            if isinstance(base, dict):
                base_url = base.get("url", "")
            if not base_url:
                base_url = self.config.get("manager-api", {}).get("url", "")
            if not base_url:
                return u  # 保底返回原始相对路径
            if u.startswith("/"):
                return base_url.rstrip("/") + u
            return base_url.rstrip("/") + "/" + u

        # 合并：默认列表 + 覆盖 url/fileSize
        override_map = {item.get("code"): item for item in overrides}
        result = []
        for base in DEFAULT_EMOTIONS:
            code = base["code"]
            over = override_map.get(code)
            result.append(
                {
                    "id": base["id"],
                    "emoji": base["emoji"],
                    "code": code,
                    "url": normalize_url((over or {}).get("url", "")),
                    "fileSize": (over or {}).get("fileSize", 0),
                }
            )

        return web.json_response({"code": 0, "data": result})
