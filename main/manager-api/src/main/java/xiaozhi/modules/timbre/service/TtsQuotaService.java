package xiaozhi.modules.timbre.service;

import java.util.Date;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;

import lombok.AllArgsConstructor;
import xiaozhi.modules.timbre.dao.TtsQuotaDao;
import xiaozhi.modules.timbre.dao.TtsSlotDao;
import xiaozhi.modules.timbre.entity.TtsQuotaEntity;
import xiaozhi.modules.timbre.entity.TtsSlotEntity;

@Service
@AllArgsConstructor
public class TtsQuotaService {
    private final TtsQuotaDao ttsQuotaDao;
    private final TtsSlotDao ttsSlotDao;

    public TtsQuotaEntity getOrInit(Long userId) {
        TtsQuotaEntity q = ttsQuotaDao.selectOne(new LambdaQueryWrapper<TtsQuotaEntity>()
                .eq(TtsQuotaEntity::getUserId, userId));
        if (q == null) {
            q = new TtsQuotaEntity();
            q.setUserId(userId);
            q.setCharLimit(0L);
            q.setCallLimit(0L);
            q.setCharUsed(0L);
            q.setCallUsed(0L);
            // 默认每个用户可创建的音色位上限：3
            q.setSlots(3);
            q.setUpdatedAt(new Date());
            ttsQuotaDao.insert(q);
        } else if (q.getSlots() == null) {
            // 历史数据兜底：旧记录 slots 为空时补默认值 3
            q.setSlots(3);
            q.setUpdatedAt(new Date());
            ttsQuotaDao.updateById(q);
        }
        return q;
    }

    /** 返回用户音色位上限，若未配置则返回默认值 3（并回写DB） */
    public int getSlotsLimitOrDefault(Long userId) {
        TtsQuotaEntity q = getOrInit(userId);
        Integer limit = q.getSlots();
        if (limit == null || limit <= 0) {
            // <=0 视作未配置，按默认 3 处理
            limit = 3;
            if (!Integer.valueOf(3).equals(q.getSlots())) {
                q.setSlots(3);
                q.setUpdatedAt(new Date());
                ttsQuotaDao.updateById(q);
            }
        }
        return limit;
    }

    public void upsert(Long userId, Long charLimit, Long callLimit, Integer slots) {
        TtsQuotaEntity q = ttsQuotaDao.selectOne(new LambdaQueryWrapper<TtsQuotaEntity>()
                .eq(TtsQuotaEntity::getUserId, userId));
        if (q == null) {
            q = new TtsQuotaEntity();
            q.setUserId(userId);
        }
        if (charLimit != null) q.setCharLimit(charLimit);
        if (callLimit != null) q.setCallLimit(callLimit);
        q.setUpdatedAt(new Date());
        q.setSlots(slots);
        if (q.getId() == null) {
            ttsQuotaDao.insert(q);
        } else {
            ttsQuotaDao.updateById(q);
        }
    }

    public int countSlotsUsed(Long userId) {
        return Math.toIntExact(ttsSlotDao.selectCount(new LambdaQueryWrapper<TtsSlotEntity>()
                .eq(TtsSlotEntity::getUserId, userId)));
    }
}

