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
import xiaozhi.modules.model.dao.ModelConfigDao;
import xiaozhi.modules.model.entity.ModelConfigEntity;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import xiaozhi.modules.security.user.SecurityUser;
import xiaozhi.common.user.UserDetail;

@Service
@AllArgsConstructor
public class TtsCloneService {
    private final IndexTtsClient indexTtsClient;
    private final TtsSlotDao ttsSlotDao;
    private final TtsVoiceCloneDao ttsVoiceCloneDao;
    private final TimbreDao timbreDao;
    private final TtsUsageService ttsUsageService;
    private final TtsQuotaService ttsQuotaService;
    private final ModelConfigDao modelConfigDao;

    private String getDefaultTtsModelId() {
        // 优先取 IndexStreamTTS 模型（包含 IndexStream 的模型）
        ModelConfigEntity indexStream = modelConfigDao.selectOne(new QueryWrapper<ModelConfigEntity>()
                .eq("model_type", "TTS")
                .eq("is_enabled", 1)
                .like("model_code", "IndexStream")
                .or()
                .like("model_name", "IndexStream")
                .last("limit 1"));
        if (indexStream != null) return indexStream.getId();

        // 次优先：取默认且启用的 TTS 模型
        ModelConfigEntity def = modelConfigDao.selectOne(new QueryWrapper<ModelConfigEntity>()
                .eq("model_type", "TTS")
                .eq("is_enabled", 1)
                .eq("is_default", 1)
                .last("limit 1"));
        if (def != null) return def.getId();

        // 兜底：取任意启用的 TTS 模型
        ModelConfigEntity any = modelConfigDao.selectOne(new QueryWrapper<ModelConfigEntity>()
                .eq("model_type", "TTS")
                .eq("is_enabled", 1)
                .orderByAsc("sort")
                .last("limit 1"));
        return any == null ? null : any.getId();
    }

    public VoiceCloneResponseDTO cloneCreateOrUpdate(Long userId, String slotId, List<String> fileUrls, String name) {
        // 未传 slotId：首次克隆（先校验音色位额度，再调用上游，成功后再写库）
        if (StringUtils.isBlank(slotId)) {
            // 首次创建必须填写音色名称
            if (StringUtils.isBlank(name)) {
                throw new RenException("请填写音色名称");
            }
            // 管理员不受音色位数量限制
            boolean isAdmin = isCurrentUserAdmin();
            if (!isAdmin) {
                // 配额：按用户的音色位上限（默认3）校验
                int limit = ttsQuotaService.getSlotsLimitOrDefault(userId);
                int usedSlots = ttsQuotaService.countSlotsUsed(userId);
                if (usedSlots >= limit) {
                    throw new RenException("音色位已达上限");
                }
            }
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
            // 默认计费方式：字符（char）。兼容旧逻辑，'char' 等价于 'token'。
            slot.setQuotaMode("char");
            slot.setStatus("active");
            // 重录上限：默认 4 次；创建本次计为 1 次使用。
            Integer inc = res.getFiles_accepted() == null ? 0 : res.getFiles_accepted();
            // 管理员：无限重录（0表示不限）；普通用户：默认4次
            slot.setCloneLimit(isAdmin ? 0 : 4);
            slot.setCloneUsed(1);
            slot.setLastClonedAt(new Date());
            slot.setCreatedAt(new Date());
            slot.setUpdatedAt(new Date());
            // 自动绑定到默认 TTS 模型（IndexStream 建议配置为默认）
            String ttsModelId = getDefaultTtsModelId();
            if (StringUtils.isNotBlank(ttsModelId)) {
                slot.setTtsModelId(ttsModelId);
            }
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

            // 自动为用户创建镜像到共享音色表（仅用户自己可见，管理员可以后续公开）
            // 这样可以确保用户的音色在模型配置中可见并可以选择
            if (StringUtils.isNotBlank(ttsModelId) && StringUtils.isNotBlank(res.getVoice_id())) {
                try {
                    // 创建镜像（使用slotId作为id，确保唯一性）
                    TimbreEntity mirror = new TimbreEntity();
                    mirror.setId(newSlotId);
                    mirror.setTtsModelId(ttsModelId);
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
                } catch (Exception e) {
                    // 镜像创建失败不影响主流程，只记录日志
                    System.err.println("为用户创建音色镜像失败: " + e.getMessage());
                }
            }

            // 用量：按“次”累计1次克隆（不按文件数计次）
            ttsUsageService.addUsage(userId, null, "clone", 0, 1, 0, newSlotId);

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

        // 若未绑定模型，自动绑定默认 TTS 模型（便于镜像至共享音色）
        if (StringUtils.isBlank(slot.getTtsModelId())) {
            String ttsModelId = getDefaultTtsModelId();
            if (StringUtils.isNotBlank(ttsModelId)) {
                slot.setTtsModelId(ttsModelId);
            }
        }

        // 克隆调用（若slot设置了克隆次数上限，先做基本校验）
        Integer limit = slot.getCloneLimit();
        Integer used = slot.getCloneUsed() == null ? 0 : slot.getCloneUsed();
        // 管理员不受重录上限限制
        if (!isCurrentUserAdmin()) {
            if (limit != null && limit > 0 && used >= limit) {
                throw new RenException("该音色位克隆次数已用尽");
            }
        }
        // 调用上游
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
        // 每次重录按 1 次计数（不按文件数）
        slot.setCloneUsed(used + 1);
        if (!"active".equalsIgnoreCase(StringUtils.defaultString(slot.getStatus(), ""))) {
            slot.setStatus("active");
        }
        slot.setUpdatedAt(new Date());
        ttsSlotDao.updateById(slot);

        // 记录用量：clone 次数=files_accepted
        // 用量：按“次”累计1次克隆
        ttsUsageService.addUsage(userId, null, "clone", 0, 1, 0, slotId);

        // 自动为用户创建镜像到共享音色表（仅用户自己可见，管理员可以后续公开）
        // 这样可以确保用户的音色在模型配置中可见并可以选择
        if (StringUtils.isNotBlank(slot.getTtsModelId()) && StringUtils.isNotBlank(res.getVoice_id())) {
            try {
                mirrorSlotVoice(slot, name);
            } catch (Exception e) {
                // 镜像创建失败不影响主流程，只记录日志
                System.err.println("为用户更新音色镜像失败: " + e.getMessage());
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

    /**
     * 将已有 slot 的 voice 镜像到共享音色表（ai_tts_voice），便于在模型音色列表中展示；
     * 仅当 slot 同时具备 ttsModelId 与 voiceId 时执行。
     */
    public void mirrorSlotVoice(TtsSlotEntity slot, String displayName) {
        if (slot == null) return;
        if (StringUtils.isBlank(slot.getTtsModelId())) return;
        if (StringUtils.isBlank(slot.getVoiceId())) return;

        String sid = slot.getSlotId();
        TimbreEntity mirror = new TimbreEntity();
        // 使用 slotId 作为共享音色主键，避免超出 varchar(32)
        mirror.setId(sid);
        mirror.setTtsModelId(slot.getTtsModelId());
        mirror.setTtsVoice(slot.getVoiceId());
        mirror.setName(StringUtils.defaultIfBlank(displayName, "Slot " + sid));
        mirror.setLanguages("zh");
        mirror.setVoiceDemo(slot.getPreviewUrl());

        TimbreEntity exist = timbreDao.selectById(mirror.getId());
        if (exist == null) {
            timbreDao.insert(mirror);
        } else {
            timbreDao.updateById(mirror);
        }
    }
    private boolean isCurrentUserAdmin() {
        try {
            UserDetail u = SecurityUser.getUser();
            Object v = (u == null) ? null : u.getSuperAdmin();
            if (v == null) return false;
            if (v instanceof Integer) return ((Integer) v) == 1;
            return "1".equals(String.valueOf(v)) || "true".equalsIgnoreCase(String.valueOf(v));
        } catch (Exception e) {
            return false;
        }
    }
}
