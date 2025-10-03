package xiaozhi.modules.timbre.service;

import java.util.Date;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;

import lombok.AllArgsConstructor;
import xiaozhi.common.exception.RenException;
import xiaozhi.modules.timbre.dao.TimbreDao;
import xiaozhi.modules.timbre.service.TtsUsageService;
import xiaozhi.modules.timbre.dao.TtsSlotDao;
import xiaozhi.modules.timbre.dao.TtsVoiceCloneDao;
import xiaozhi.modules.timbre.dto.VoiceCloneResponseDTO;
import xiaozhi.modules.timbre.entity.TimbreEntity;
import xiaozhi.modules.timbre.entity.TtsSlotEntity;
import xiaozhi.modules.timbre.entity.TtsVoiceCloneEntity;

@Service
@AllArgsConstructor
public class TtsCloneService {
    private final IndexTtsClient indexTtsClient;
    private final TtsSlotDao ttsSlotDao;
    private final TtsVoiceCloneDao ttsVoiceCloneDao;
    private final TimbreDao timbreDao;
    private final TtsUsageService ttsUsageService;

    public VoiceCloneResponseDTO cloneCreateOrUpdate(Long userId, String slotId, List<String> fileUrls, String name) {
        // 未传 slotId：首次克隆（先调用上游，成功后再写库）
        if (StringUtils.isBlank(slotId)) {
            IndexTtsClient.CloneResult res = indexTtsClient.cloneVoice(fileUrls);
            if (res == null || StringUtils.isBlank(res.getVoice_id())) {
                // 克隆失败不落库
                throw new RenException("克隆失败：未返回voice_id");
            }
            String newSlotId = java.util.UUID.randomUUID().toString().replace("-", "");

            TtsSlotEntity slot = new TtsSlotEntity();
            slot.setSlotId(newSlotId);
            slot.setUserId(userId);
            slot.setVoiceId(res.getVoice_id());
            slot.setPreviewUrl(res.getPreview_url());
            slot.setStatus("active");
            Integer inc = res.getFiles_accepted() == null ? 0 : res.getFiles_accepted();
            slot.setCloneLimit(0);
            slot.setCloneUsed(inc);
            slot.setLastClonedAt(new Date());
            slot.setCreatedAt(new Date());
            slot.setUpdatedAt(new Date());
            ttsSlotDao.insert(slot);

            TtsVoiceCloneEntity his = new TtsVoiceCloneEntity();
            his.setUserId(userId);
            his.setSlotId(newSlotId);
            his.setVoiceId(res.getVoice_id());
            his.setName(name);
            his.setStatus("active");
            his.setPreviewUrl(res.getPreview_url());
            his.setSource("uploaded");
            his.setCreatedAt(new Date());
            his.setUpdatedAt(new Date());
            ttsVoiceCloneDao.insert(his);

            if (StringUtils.isNotBlank(slot.getTtsModelId())) {
                TimbreEntity mirror = new TimbreEntity();
                mirror.setId("SLOT_" + newSlotId);
                mirror.setTtsModelId(slot.getTtsModelId());
                mirror.setTtsVoice(res.getVoice_id());
                mirror.setName(StringUtils.defaultIfBlank(name, "Slot " + newSlotId));
                mirror.setLanguages("zh");
                mirror.setVoiceDemo(res.getPreview_url());
                TimbreEntity exist = timbreDao.selectById(mirror.getId());
                if (exist == null) {
                    timbreDao.insert(mirror);
                } else {
                    timbreDao.updateById(mirror);
                }
            }

            if (inc != null && inc > 0) {
                ttsUsageService.addUsage(userId, null, "clone", 0, inc, 0, newSlotId);
            }

            VoiceCloneResponseDTO dto = new VoiceCloneResponseDTO();
            dto.setVoiceId(res.getVoice_id());
            dto.setFilesAccepted(res.getFiles_accepted());
            dto.setFilesSkipped(res.getFiles_skipped());
            dto.setPreviewUrl(res.getPreview_url());
            dto.setSlotId(newSlotId);
            dto.setCloneUsed(slot.getCloneUsed());
            dto.setCloneLimit(slot.getCloneLimit());
            return dto;
        }

        // 已有 slotId：走更新逻辑
        return cloneToSlot(userId, slotId, fileUrls, name);
    }

    public VoiceCloneResponseDTO cloneToSlot(Long userId, String slotId, List<String> fileUrls, String name) {
        // 校验slot
        TtsSlotEntity slot = ttsSlotDao.selectOne(new LambdaQueryWrapper<TtsSlotEntity>()
                .eq(TtsSlotEntity::getSlotId, slotId));
        if (slot == null) throw new RenException("音色位不存在");
        if (StringUtils.equalsIgnoreCase(slot.getStatus(), "disabled")) {
            throw new RenException("音色位已禁用");
        }

        // 克隆调用
        IndexTtsClient.CloneResult res = indexTtsClient.cloneVoice(fileUrls);
        if (res == null || StringUtils.isBlank(res.getVoice_id())) {
            throw new RenException("克隆失败：未返回voice_id");
        }

        // 写历史
        TtsVoiceCloneEntity his = new TtsVoiceCloneEntity();
        his.setUserId(userId);
        his.setSlotId(slotId);
        his.setVoiceId(res.getVoice_id());
        his.setName(name);
        his.setStatus("active");
        his.setPreviewUrl(res.getPreview_url());
        his.setSource("uploaded");
        his.setCreatedAt(new Date());
        his.setUpdatedAt(new Date());
        ttsVoiceCloneDao.insert(his);

        // 更新slot
        slot.setVoiceId(res.getVoice_id());
        slot.setPreviewUrl(res.getPreview_url());
        slot.setLastClonedAt(new Date());
        Integer used = slot.getCloneUsed() == null ? 0 : slot.getCloneUsed();
        Integer inc = res.getFiles_accepted() == null ? 0 : res.getFiles_accepted();
        slot.setCloneUsed(used + inc);
        if (!"active".equalsIgnoreCase(StringUtils.defaultString(slot.getStatus(), ""))) {
            slot.setStatus("active");
        }
        slot.setUpdatedAt(new Date());
        ttsSlotDao.updateById(slot);

        // 记录用量：clone 次数=files_accepted
        if (inc != null && inc > 0) {
            ttsUsageService.addUsage(userId, null, "clone", 0, inc, 0, slotId);
        }

        // 可选：镜像到共享音色，便于Agent映射（id= SLOTx<slotId>）
        if (StringUtils.isNotBlank(slot.getTtsModelId())) {
            TimbreEntity mirror = new TimbreEntity();
            mirror.setId("SLOT_" + slotId);
            mirror.setTtsModelId(slot.getTtsModelId());
            mirror.setTtsVoice(res.getVoice_id());
            mirror.setName(StringUtils.defaultIfBlank(name, "Slot " + slotId));
            mirror.setLanguages("zh");
            mirror.setVoiceDemo(res.getPreview_url());
            // upsert by replace
            TimbreEntity exist = timbreDao.selectById(mirror.getId());
            if (exist == null) {
                timbreDao.insert(mirror);
            } else {
                timbreDao.updateById(mirror);
            }
        }

        VoiceCloneResponseDTO dto = new VoiceCloneResponseDTO();
        dto.setVoiceId(res.getVoice_id());
        dto.setFilesAccepted(res.getFiles_accepted());
        dto.setFilesSkipped(res.getFiles_skipped());
        dto.setPreviewUrl(res.getPreview_url());
        dto.setSlotId(slotId);
        dto.setCloneUsed(slot.getCloneUsed());
        dto.setCloneLimit(slot.getCloneLimit());
        return dto;
    }
}
