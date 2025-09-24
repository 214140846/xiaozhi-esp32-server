package xiaozhi.modules.emotion.service;

import java.util.List;

import xiaozhi.common.service.BaseService;
import xiaozhi.modules.emotion.entity.EmotionAssetEntity;

public interface EmotionAssetService extends BaseService<EmotionAssetEntity> {
    List<EmotionAssetEntity> listByAgentId(String agentId);

    EmotionAssetEntity upsert(String agentId, String code, String emoji, String filePath, long fileSize, String contentType);

    List<EmotionAssetEntity> listByMac(String macAddress);
}

