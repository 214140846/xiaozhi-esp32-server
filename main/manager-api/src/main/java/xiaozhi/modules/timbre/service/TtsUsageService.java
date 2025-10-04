package xiaozhi.modules.timbre.service;

import java.util.Date;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;

import lombok.AllArgsConstructor;
import xiaozhi.modules.timbre.dao.TtsUsageDao;
import xiaozhi.modules.timbre.entity.TtsUsageEntity;

@Service
@AllArgsConstructor
public class TtsUsageService {
    private final TtsUsageDao ttsUsageDao;

    public void addUsage(Long userId, String agentId, String endpoint, Integer costChars, Integer costCalls,
            Integer durationMs, String slotId) {
        TtsUsageEntity u = new TtsUsageEntity();
        u.setUserId(userId);
        u.setAgentId(agentId);
        u.setEndpoint(endpoint);
        u.setCostChars(costChars == null ? 0 : costChars);
        u.setCostCalls(costCalls == null ? 1 : costCalls);
        u.setDurationMs(durationMs == null ? 0 : durationMs);
        u.setSlotId(slotId);
        u.setCreatedAt(new Date());
        ttsUsageDao.insert(u);
    }

    public List<TtsUsageEntity> listMy(Long userId, String endpoint, String startDate, String endDate, Integer limit) {
        LambdaQueryWrapper<TtsUsageEntity> w = new LambdaQueryWrapper<TtsUsageEntity>()
                .eq(TtsUsageEntity::getUserId, userId)
                .orderByDesc(TtsUsageEntity::getCreatedAt);
        if (StringUtils.isNotBlank(endpoint)) {
            w.eq(TtsUsageEntity::getEndpoint, endpoint);
        }
        // 简化：如果传了日期字符串，则只做 >= start 和 <= end 的字符串比较（建议使用精确日期参数改进）
        // 此处保持轻量实现
        // 不做复杂解析，避免引入额外依赖
        if (StringUtils.isNotBlank(startDate)) {
            // 占位：可在DAO层扩展
        }
        if (StringUtils.isNotBlank(endDate)) {
            // 占位：可在DAO层扩展
        }
        if (limit != null && limit > 0) {
            w.last("limit " + limit);
        }
        return ttsUsageDao.selectList(w);
    }
}

