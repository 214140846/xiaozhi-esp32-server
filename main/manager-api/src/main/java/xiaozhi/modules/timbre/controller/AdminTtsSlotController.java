package xiaozhi.modules.timbre.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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

@RestController
@RequestMapping("/admin/tts/slots")
@Tag(name = "音色位-管理员")
@AllArgsConstructor
public class AdminTtsSlotController {
    private final TtsSlotDao ttsSlotDao;

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
}

