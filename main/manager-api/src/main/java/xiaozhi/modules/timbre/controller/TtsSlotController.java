package xiaozhi.modules.timbre.controller;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import xiaozhi.common.utils.Result;
import xiaozhi.modules.security.user.SecurityUser;
import xiaozhi.modules.timbre.dao.TtsSlotDao;
import xiaozhi.modules.timbre.dto.TtsSlotSetModelDTO;
import xiaozhi.modules.timbre.dto.TtsSlotVO;
import xiaozhi.modules.timbre.entity.TtsSlotEntity;
import xiaozhi.modules.timbre.service.TtsCloneService;
import xiaozhi.modules.timbre.service.TtsSlotService;
import xiaozhi.modules.timbre.service.TtsQuotaService;
import xiaozhi.modules.timbre.dto.TtsQuotaVO;

@RestController
@RequestMapping("/tts/slots")
@Tag(name = "音色位-用户")
@AllArgsConstructor
public class TtsSlotController {
    private final TtsSlotService ttsSlotService;
    private final TtsSlotDao ttsSlotDao;
    private final TtsCloneService ttsCloneService;
    private final TtsQuotaService ttsQuotaService;

    @GetMapping("/mine")
    @Operation(summary = "查询我的音色位列表")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "成功",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = TtsSlotVO.class))))
    })
    @RequiresPermissions("sys:role:normal")
    public Result<List<TtsSlotVO>> mine(@RequestParam(required = false) String status) {
        Long userId = SecurityUser.getUserId();
        List<TtsSlotEntity> list = ttsSlotService.listMySlots(userId, status);
        List<TtsSlotVO> vo = list.stream().map(ttsSlotService::toVOWithName).collect(Collectors.toList());
        return new Result<List<TtsSlotVO>>().ok(vo);
    }

    @GetMapping("/{slotId}")
    @Operation(summary = "查询我的音色位详情")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "成功",
            content = @Content(schema = @Schema(implementation = TtsSlotVO.class)))
    })
    @RequiresPermissions("sys:role:normal")
    public Result<TtsSlotVO> detail(@PathVariable String slotId) {
        Long userId = SecurityUser.getUserId();
        TtsSlotEntity e = ttsSlotService.getMySlot(userId, slotId);
        return new Result<TtsSlotVO>().ok(ttsSlotService.toVOWithName(e));
    }

    @GetMapping("/quota")
    @Operation(summary = "查询我的音色位配额概览")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "成功",
            content = @Content(schema = @Schema(implementation = TtsQuotaVO.class)))
    })
    @RequiresPermissions("sys:role:normal")
    public Result<TtsQuotaVO> quota() {
        Long userId = SecurityUser.getUserId();
        int limit = ttsQuotaService.getSlotsLimitOrDefault(userId);
        int used = ttsQuotaService.countSlotsUsed(userId);
        TtsQuotaVO vo = new TtsQuotaVO();
        // 别名字段
        vo.setSlotsLimit(limit);
        vo.setSlotsUsed(used);
        vo.setSlotsRemaining(Math.max(limit - used, 0));
        // 兼容旧字段
        vo.setSlots(limit);
        vo.setSlotsRemain(Math.max(limit - used, 0));
        return new Result<TtsQuotaVO>().ok(vo);
    }

    @PutMapping("/{slotId}/model")
    @Operation(summary = "设置音色位模型并触发镜像")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "成功",
            content = @Content(schema = @Schema(implementation = TtsSlotVO.class)))
    })
    @RequiresPermissions("sys:role:normal")
    public Result<TtsSlotVO> setModel(@PathVariable String slotId, @Valid @RequestBody TtsSlotSetModelDTO dto) {
        Long userId = SecurityUser.getUserId();
        TtsSlotEntity e = ttsSlotService.getMySlot(userId, slotId);
        e.setTtsModelId(dto.getTtsModelId());
        e.setUpdatedAt(new Date());
        ttsSlotDao.updateById(e);

        // 触发镜像到共享音色库（仅用户自己可见，管理员可以后续公开）
        if (StringUtils.isNotBlank(e.getVoiceId()) && StringUtils.isNotBlank(dto.getTtsModelId())) {
            try {
                ttsCloneService.mirrorSlotVoice(e, dto.getName());
            } catch (Exception ex) {
                // 镜像失败不影响主流程，记录日志
                System.err.println("音色位模型绑定后镜像失败: " + ex.getMessage());
            }
        }

        return new Result<TtsSlotVO>().ok(ttsSlotService.toVOWithName(e));
    }
}
