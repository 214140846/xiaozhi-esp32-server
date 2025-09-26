package xiaozhi.modules.uservoice.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;

import lombok.RequiredArgsConstructor;
import xiaozhi.common.service.impl.BaseServiceImpl;
import xiaozhi.modules.uservoice.dao.UserVoiceDao;
import xiaozhi.modules.uservoice.dao.UserVoiceQuotaDao;
import xiaozhi.modules.uservoice.entity.UserVoiceEntity;
import xiaozhi.modules.uservoice.entity.UserVoiceQuotaEntity;
import xiaozhi.modules.uservoice.service.UserVoiceService;

@Service
@RequiredArgsConstructor
public class UserVoiceServiceImpl extends BaseServiceImpl<UserVoiceDao, UserVoiceEntity> implements UserVoiceService {
    private final UserVoiceDao userVoiceDao;
    private final UserVoiceQuotaDao quotaDao;

    @Override
    public List<UserVoiceEntity> listByUser(Long userId) {
        return userVoiceDao.selectList(new QueryWrapper<UserVoiceEntity>()
                .eq("user_id", userId)
                .orderByAsc("sort"));
    }

    @Override
    public int countByUser(Long userId) {
        return Math.toIntExact(userVoiceDao.selectCount(new QueryWrapper<UserVoiceEntity>().eq("user_id", userId)));
    }

    @Override
    public int getExtraSlots(Long userId) {
        UserVoiceQuotaEntity q = quotaDao.selectById(userId);
        return q == null || q.getExtraSlots() == null ? 0 : q.getExtraSlots();
    }

    @Override
    public void setExtraSlots(Long userId, int extraSlots) {
        UserVoiceQuotaEntity exist = quotaDao.selectById(userId);
        if (exist == null) {
            UserVoiceQuotaEntity q = new UserVoiceQuotaEntity();
            q.setUserId(userId);
            q.setExtraSlots(extraSlots);
            quotaDao.insert(q);
        } else {
            exist.setExtraSlots(extraSlots);
            quotaDao.updateById(exist);
        }
    }

    @Override
    public String getUserApiKey(Long userId) {
        UserVoiceQuotaEntity q = quotaDao.selectById(userId);
        return q == null ? null : q.getApiKey();
    }

    @Override
    public void setUserApiKey(Long userId, String apiKey) {
        UserVoiceQuotaEntity exist = quotaDao.selectById(userId);
        if (exist == null) {
            UserVoiceQuotaEntity q = new UserVoiceQuotaEntity();
            q.setUserId(userId);
            q.setExtraSlots(0);
            q.setApiKey(apiKey);
            quotaDao.insert(q);
        } else {
            exist.setApiKey(apiKey);
            quotaDao.updateById(exist);
        }
    }
}
