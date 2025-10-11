package xiaozhi.modules.timbre.service;

import java.util.List;
import org.apache.commons.lang3.StringUtils;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;

import lombok.AllArgsConstructor;
import xiaozhi.common.exception.RenException;
import xiaozhi.modules.timbre.dao.TtsSlotDao;
import xiaozhi.modules.timbre.dao.TimbreDao;
import xiaozhi.modules.timbre.dao.TtsVoiceCloneDao;
import xiaozhi.modules.timbre.dto.TtsSlotVO;
import xiaozhi.modules.timbre.entity.TtsSlotEntity;
import xiaozhi.modules.timbre.entity.TimbreEntity;
import xiaozhi.modules.timbre.entity.TtsVoiceCloneEntity;

@Service
@AllArgsConstructor
public class TtsSlotService {
    private final TtsSlotDao ttsSlotDao;
    private final TimbreDao timbreDao;
    private final TtsVoiceCloneDao ttsVoiceCloneDao;

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

    /**
     * 带名称补充的VO转换：
     * 1) 优先从共享音色表(ai_tts_voice，主键=slotId)读取 name；
     * 2) 若没有，再取该slot最新的克隆历史(ai_tts_voice_clone)中的 name；
     * 3) 再没有则在绑定了voiceId时回退为 "Slot <slotId>"。
     */
    public TtsSlotVO toVOWithName(TtsSlotEntity e) {
        TtsSlotVO vo = toVO(e);
        if (vo == null) return null;
        String name = null;
        if (e != null && StringUtils.isNotBlank(e.getSlotId())) {
            TimbreEntity mirror = timbreDao.selectById(e.getSlotId());
            if (mirror != null && StringUtils.isNotBlank(mirror.getName())) {
                name = mirror.getName();
            }
            if (StringUtils.isBlank(name)) {
                TtsVoiceCloneEntity last = ttsVoiceCloneDao.selectOne(
                    new LambdaQueryWrapper<TtsVoiceCloneEntity>()
                        .eq(TtsVoiceCloneEntity::getSlotId, e.getSlotId())
                        .orderByDesc(TtsVoiceCloneEntity::getUpdatedAt)
                        .last("limit 1")
                );
                if (last != null && StringUtils.isNotBlank(last.getName())) {
                    name = last.getName();
                }
            }
        }
        if (StringUtils.isBlank(name) && StringUtils.isNotBlank(vo.getVoiceId())) {
            name = "Slot " + vo.getSlotId();
        }
        vo.setName(name);
        return vo;
    }
}

