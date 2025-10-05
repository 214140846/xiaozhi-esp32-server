package xiaozhi.modules.timbre.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
import lombok.AllArgsConstructor;
import xiaozhi.common.utils.Result;
import xiaozhi.modules.security.user.SecurityUser;
import xiaozhi.modules.timbre.dto.TtsSlotVO;
import xiaozhi.modules.timbre.entity.TtsSlotEntity;
import xiaozhi.modules.timbre.service.TtsSlotService;

@RestController
@RequestMapping("/tts/slots")
@Tag(name = "音色位-查询")
@AllArgsConstructor
public class TtsSlotController {
    private final TtsSlotService ttsSlotService;

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
        List<TtsSlotVO> vo = list.stream().map(TtsSlotService::toVO).collect(Collectors.toList());
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
        return new Result<TtsSlotVO>().ok(TtsSlotService.toVO(e));
    }
}
