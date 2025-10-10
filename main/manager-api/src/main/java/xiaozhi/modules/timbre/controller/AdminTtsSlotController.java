package xiaozhi.modules.timbre.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import xiaozhi.common.utils.Result;
import xiaozhi.modules.timbre.dao.TtsSlotDao;
import xiaozhi.modules.timbre.dto.TtsSlotAllocateDTO;
import xiaozhi.modules.timbre.dto.TtsSlotUpdateDTO;
import xiaozhi.modules.timbre.dto.TtsSlotVO;
import xiaozhi.modules.timbre.entity.TtsSlotEntity;
import xiaozhi.modules.timbre.dao.TimbreDao;
import xiaozhi.modules.timbre.entity.TimbreEntity;
import xiaozhi.modules.timbre.service.TtsCloneService;
import xiaozhi.modules.model.dao.ModelConfigDao;
import xiaozhi.modules.model.entity.ModelConfigEntity;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import xiaozhi.modules.timbre.dao.TtsVoiceCloneDao;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;

@RestController
@RequestMapping("/admin/tts/slots")
@Tag(name = "音色位-管理员")
@AllArgsConstructor
public class AdminTtsSlotController {
    private final TtsSlotDao ttsSlotDao;
    private final TimbreDao timbreDao;
    private final TtsCloneService ttsCloneService;
    private final ModelConfigDao modelConfigDao;
    private final TtsVoiceCloneDao ttsVoiceCloneDao;

    @PostMapping("/allocate")
    @Operation(summary = "为用户分配音色位")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "成功",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = TtsSlotVO.class))))
    })
    @RequiresPermissions("sys:role:superAdmin")
    public Result<List<TtsSlotVO>> allocate(@Valid @RequestBody TtsSlotAllocateDTO dto) {
        int count = dto.getCount() == null || dto.getCount() < 1 ? 1 : dto.getCount();
        List<TtsSlotVO> out = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            String slotId = UUID.randomUUID().toString().replace("-", "");
            TtsSlotEntity e = new TtsSlotEntity();
            e.setSlotId(slotId);
            e.setUserId(dto.getUserId());
            e.setTtsModelId(dto.getTtsModelId());
            e.setCloneLimit(dto.getCloneLimit());
            e.setCloneUsed(0);
            e.setQuotaMode(dto.getQuotaMode());
            e.setTtsCallLimit(dto.getTtsCallLimit());
            e.setTtsCallUsed(0);
            e.setTtsTokenLimit(dto.getTtsTokenLimit());
            e.setTtsTokenUsed(0L);
            e.setStatus("empty");
            e.setCreatedAt(new Date());
            e.setUpdatedAt(new Date());
            ttsSlotDao.insert(e);
            out.add(xiaozhi.modules.timbre.service.TtsSlotService.toVO(e));
        }
        return new Result<List<TtsSlotVO>>().ok(out);
    }

    @PutMapping("/{slotId}")
    @Operation(summary = "更新音色位设置")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "成功",
            content = @Content(schema = @Schema(implementation = TtsSlotVO.class)))
    })
    @RequiresPermissions("sys:role:superAdmin")
    public Result<TtsSlotVO> update(@PathVariable String slotId, @Valid @RequestBody TtsSlotUpdateDTO dto) {
        TtsSlotEntity e = ttsSlotDao.selectOne(new LambdaQueryWrapper<TtsSlotEntity>()
                .eq(TtsSlotEntity::getSlotId, slotId));
        if (e == null) {
            return new Result<TtsSlotVO>().error("音色位不存在");
        }
        if (dto.getCloneLimit() != null) e.setCloneLimit(dto.getCloneLimit());
        if (dto.getQuotaMode() != null) e.setQuotaMode(dto.getQuotaMode());
        if (dto.getTtsCallLimit() != null) e.setTtsCallLimit(dto.getTtsCallLimit());
        if (dto.getTtsTokenLimit() != null) e.setTtsTokenLimit(dto.getTtsTokenLimit());
        if (dto.getStatus() != null) e.setStatus(dto.getStatus());
        e.setUpdatedAt(new Date());
        ttsSlotDao.updateById(e);
        return new Result<TtsSlotVO>().ok(xiaozhi.modules.timbre.service.TtsSlotService.toVO(e));
    }

    @GetMapping("/{slotId}/mirror")
    @Operation(summary = "查询音色位是否已公开（是否存在镜像）")
    @RequiresPermissions("sys:role:superAdmin")
    public Result<java.util.Map<String, Object>> mirrorStatus(@PathVariable String slotId) {
        TimbreEntity m = timbreDao.selectById(slotId);
        java.util.HashMap<String, Object> out = new java.util.HashMap<>();
        out.put("public", m != null);
        out.put("name", m == null ? null : m.getName());
        return new Result<java.util.Map<String, Object>>().ok(out);
    }

    @PutMapping("/{slotId}/mirror")
    @Operation(summary = "公开音色位：创建或更新镜像到共享音色库")
    @RequiresPermissions("sys:role:superAdmin")
    public Result<Void> mirrorOn(@PathVariable String slotId, @RequestBody(required = false) java.util.Map<String, Object> body) {
        TtsSlotEntity slot = ttsSlotDao.selectOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<TtsSlotEntity>()
                .eq(TtsSlotEntity::getSlotId, slotId));
        if (slot == null) {
            return new Result<Void>().error("音色位不存在");
        }
        if (slot.getTtsModelId() == null || slot.getTtsModelId().isEmpty()) {
            // 自动补绑默认TTS（TTS/启用/默认；否则任意启用一条）
            ModelConfigEntity def = modelConfigDao.selectOne(new QueryWrapper<ModelConfigEntity>()
                    .eq("model_type", "TTS").eq("is_enabled", 1).eq("is_default", 1).last("limit 1"));
            if (def == null) {
                def = modelConfigDao.selectOne(new QueryWrapper<ModelConfigEntity>()
                        .eq("model_type", "TTS").eq("is_enabled", 1).orderByAsc("sort").last("limit 1"));
            }
            if (def != null) {
                slot.setTtsModelId(def.getId());
                slot.setUpdatedAt(new java.util.Date());
                ttsSlotDao.updateById(slot);
            } else {
                return new Result<Void>().error("未找到可用的TTS模型");
            }
        }
        String name = null;
        if (body != null && body.get("name") != null) name = String.valueOf(body.get("name"));
        ttsCloneService.mirrorSlotVoice(slot, name);
        // 标记为公开
        slot.setStatus("public");
        slot.setUpdatedAt(new java.util.Date());
        ttsSlotDao.updateById(slot);
        return new Result<Void>();
    }

    @DeleteMapping("/{slotId}/mirror")
    @Operation(summary = "取消公开：删除共享音色镜像")
    @RequiresPermissions("sys:role:superAdmin")
    public Result<Void> mirrorOff(@PathVariable String slotId) {
        timbreDao.deleteById(slotId);
        // 取消公开标记
        TtsSlotEntity slot = ttsSlotDao.selectOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<TtsSlotEntity>()
                .eq(TtsSlotEntity::getSlotId, slotId));
        if (slot != null) {
            if (!"disabled".equalsIgnoreCase(String.valueOf(slot.getStatus()))) {
                slot.setStatus("active");
            }
            slot.setUpdatedAt(new java.util.Date());
            ttsSlotDao.updateById(slot);
        }
        return new Result<Void>();
    }

    @DeleteMapping("/{slotId}")
    @Operation(summary = "删除音色位（同时删除镜像与克隆历史）")
    @RequiresPermissions("sys:role:superAdmin")
    public Result<Void> deleteSlot(@PathVariable String slotId) {
        // 删除镜像
        timbreDao.deleteById(slotId);
        // 删除克隆历史
        ttsVoiceCloneDao.delete(new LambdaQueryWrapper<xiaozhi.modules.timbre.entity.TtsVoiceCloneEntity>()
                .eq(xiaozhi.modules.timbre.entity.TtsVoiceCloneEntity::getSlotId, slotId));
        // 删除slot
        ttsSlotDao.delete(new LambdaQueryWrapper<TtsSlotEntity>()
                .eq(TtsSlotEntity::getSlotId, slotId));
        return new Result<Void>();
    }
}
