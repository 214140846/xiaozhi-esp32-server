package xiaozhi.modules.uservoice.service;

import java.util.List;

import xiaozhi.common.service.BaseService;
import xiaozhi.modules.uservoice.entity.UserVoiceEntity;

public interface UserVoiceService extends BaseService<UserVoiceEntity> {
    List<UserVoiceEntity> listByUser(Long userId);
    int countByUser(Long userId);
    int getExtraSlots(Long userId);
    void setExtraSlots(Long userId, int extraSlots);
    String getUserApiKey(Long userId);
    void setUserApiKey(Long userId, String apiKey);
}
