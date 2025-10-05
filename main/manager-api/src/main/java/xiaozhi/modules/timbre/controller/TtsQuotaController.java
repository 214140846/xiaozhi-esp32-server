package xiaozhi.modules.timbre.controller;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import xiaozhi.common.utils.Result;
import xiaozhi.modules.security.user.SecurityUser;
import xiaozhi.modules.timbre.dto.TtsQuotaUpdateDTO;
import xiaozhi.modules.timbre.dto.TtsQuotaVO;
import xiaozhi.modules.timbre.entity.TtsQuotaEntity;
import xiaozhi.modules.timbre.service.TtsQuotaService;

@RestController
@RequestMapping("/tts/quota")
@Tag(name = "TTS配额")
@AllArgsConstructor
public class TtsQuotaController {
    private final TtsQuotaService ttsQuotaService;

    @GetMapping("/mine")
    @Operation(summary = "查询我的配额")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "成功",
            content = @Content(schema = @Schema(implementation = TtsQuotaVO.class)))
    })
    @RequiresPermissions("sys:role:normal")
    public Result<TtsQuotaVO> mine() {
        Long userId = SecurityUser.getUserId();
        TtsQuotaEntity q = ttsQuotaService.getOrInit(userId);
        int used = ttsQuotaService.countSlotsUsed(userId);
        TtsQuotaVO vo = new TtsQuotaVO();
        vo.setCharLimit(nullToZero(q.getCharLimit()));
        vo.setCallLimit(nullToZero(q.getCallLimit()));
        vo.setCharUsed(nullToZero(q.getCharUsed()));
        vo.setCallUsed(nullToZero(q.getCallUsed()));
        vo.setSlots(q.getSlots());
        vo.setSlotsUsed(used);
        Integer limit = q.getSlots();
        vo.setSlotsRemain(limit == null ? null : Math.max(limit - used, 0));
        return new Result<TtsQuotaVO>().ok(vo);
    }

    @PutMapping("/{userId}")
    @Operation(summary = "管理员更新用户配额")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "成功")
    })
    @RequiresPermissions("sys:role:superAdmin")
    public Result<Void> update(@PathVariable Long userId, @Valid @RequestBody TtsQuotaUpdateDTO dto) {
        // 路径与体内的userId保持一致
        if (dto.getUserId() == null) dto.setUserId(userId);
        if (!userId.equals(dto.getUserId())) {
            return new Result<Void>().error("userId不一致");
        }
        ttsQuotaService.upsert(dto.getUserId(), dto.getCharLimit(), dto.getCallLimit(), dto.getSlots());
        return new Result<>();
    }

    private Long nullToZero(Long v) { return v == null ? 0L : v; }
}
