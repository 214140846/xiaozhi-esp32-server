package xiaozhi.modules.timbre.controller;

import java.util.List;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.web.bind.annotation.GetMapping;
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
import xiaozhi.modules.timbre.entity.TtsUsageEntity;
import xiaozhi.modules.timbre.dto.TtsUsageStatisticsDTO;
import xiaozhi.modules.timbre.dto.UserUsageStatisticsDTO;
import xiaozhi.modules.timbre.service.TtsUsageService;

@RestController
@RequestMapping("/tts/usage")
@Tag(name = "TTS用量-查询")
@AllArgsConstructor
public class TtsUsageController {
    private final TtsUsageService ttsUsageService;

    @GetMapping("/mine")
    @Operation(summary = "查询我的用量流水")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "成功",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = TtsUsageEntity.class))))
    })
    @RequiresPermissions("sys:role:normal")
    public Result<List<TtsUsageEntity>> mine(
            @RequestParam(required = false) String endpoint,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false, defaultValue = "50") Integer limit) {
        Long userId = SecurityUser.getUserId();
        List<TtsUsageEntity> list = ttsUsageService.listMy(userId, endpoint, start, end, limit);
        return new Result<List<TtsUsageEntity>>().ok(list);
    }

    @GetMapping("/admin/list")
    @Operation(summary = "管理员查询用量流水")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "成功",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = TtsUsageEntity.class))))
    })
    @RequiresPermissions("sys:role:superAdmin")
    public Result<List<TtsUsageEntity>> adminList(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String endpoint,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false, defaultValue = "100") Integer limit) {
        List<TtsUsageEntity> list = ttsUsageService.listAdmin(userId, endpoint, start, end, limit);
        return new Result<List<TtsUsageEntity>>().ok(list);
    }

    @GetMapping("/mine/statistics")
    @Operation(summary = "我的用量统计汇总")
    @RequiresPermissions("sys:role:normal")
    public Result<TtsUsageStatisticsDTO> myStats(
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end) {
        Long userId = SecurityUser.getUserId();
        TtsUsageStatisticsDTO s = ttsUsageService.statsMy(userId, start, end);
        return new Result<TtsUsageStatisticsDTO>().ok(s);
    }

    @GetMapping("/admin/statistics")
    @Operation(summary = "管理员用量统计汇总（可选按用户过滤）")
    @RequiresPermissions("sys:role:superAdmin")
    public Result<TtsUsageStatisticsDTO> adminStats(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end) {
        TtsUsageStatisticsDTO s = ttsUsageService.statsAdmin(userId, start, end);
        return new Result<TtsUsageStatisticsDTO>().ok(s);
    }

    @GetMapping("/admin/statisticsByUser")
    @Operation(summary = "管理员：按用户聚合统计")
    @RequiresPermissions("sys:role:superAdmin")
    public Result<List<UserUsageStatisticsDTO>> statsByUser(
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end) {
        List<UserUsageStatisticsDTO> list = ttsUsageService.statsByUser(start, end);
        return new Result<List<UserUsageStatisticsDTO>>().ok(list);
    }
}
