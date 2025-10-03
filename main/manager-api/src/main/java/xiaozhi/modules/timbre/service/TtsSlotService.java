package xiaozhi.modules.timbre.service;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;

import lombok.AllArgsConstructor;
import xiaozhi.common.exception.RenException;
import xiaozhi.modules.timbre.dao.TtsSlotDao;
import xiaozhi.modules.timbre.dto.TtsSlotVO;
import xiaozhi.modules.timbre.entity.TtsSlotEntity;

@Service
@AllArgsConstructor
public class TtsSlotService {
    private final TtsSlotDao ttsSlotDao;

    public List<TtsSlotEntity> listMySlots(Long userId, String status) {
        LambdaQueryWrapper<TtsSlotEntity> w = new LambdaQueryWrapper<TtsSlotEntity>()
                .eq(TtsSlotEntity::getUserId, userId)
                .orderByDesc(TtsSlotEntity::getUpdatedAt);
        if (StringUtils.isNotBlank(status)) {
            w.eq(TtsSlotEntity::getStatus, status);
        }
        return ttsSlotDao.selectList(w);
    }

    public TtsSlotEntity getMySlot(Long userId, String slotId) {
        TtsSlotEntity e = ttsSlotDao.selectOne(new LambdaQueryWrapper<TtsSlotEntity>()
                .eq(TtsSlotEntity::getSlotId, slotId));
        if (e == null || (e.getUserId() != null && !e.getUserId().equals(userId))) {
            throw new RenException("音色位不存在");
        }
        return e;
    }

    public static TtsSlotVO toVO(TtsSlotEntity e) {
        if (e == null) return null;
        TtsSlotVO vo = new TtsSlotVO();
        vo.setSlotId(e.getSlotId());
        vo.setTtsModelId(e.getTtsModelId());
        vo.setVoiceId(e.getVoiceId());
        vo.setPreviewUrl(e.getPreviewUrl());
        vo.setCloneLimit(e.getCloneLimit());
        vo.setCloneUsed(e.getCloneUsed());
        vo.setStatus(e.getStatus());
        vo.setLastClonedAt(e.getLastClonedAt());
        vo.setCreatedAt(e.getCreatedAt());
        vo.setUpdatedAt(e.getUpdatedAt());
        return vo;
    }
}

