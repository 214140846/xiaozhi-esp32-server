package xiaozhi.modules.timbre.controller;

import java.util.List;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
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
import xiaozhi.modules.timbre.dto.TtsTestSpeakDTO;
import xiaozhi.modules.timbre.dto.VoiceCloneRequestDTO;
import xiaozhi.modules.timbre.dto.VoiceCloneResponseDTO;
import xiaozhi.modules.timbre.vo.TimbreDetailsVO;
import xiaozhi.modules.timbre.service.IndexTtsClient;
import xiaozhi.modules.timbre.service.TtsCloneService;
import xiaozhi.modules.timbre.service.TimbreService;
import xiaozhi.modules.timbre.dao.TtsSlotDao;
import xiaozhi.modules.timbre.entity.TtsSlotEntity;
import xiaozhi.modules.security.user.SecurityUser;
import xiaozhi.modules.timbre.service.TtsUsageService;

@RestController
@RequestMapping
@Tag(name = "TTS克隆与测试")
@AllArgsConstructor
public class TimbreCloneController {
    private final TtsCloneService ttsCloneService;
    private final IndexTtsClient indexTtsClient;
    private final TimbreService timbreService;
    private final TtsSlotDao ttsSlotDao;
    private final TtsUsageService ttsUsageService;

    @PostMapping("/ttsVoice/clone")
    @Operation(summary = "音色克隆到音色位")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "成功",
            content = @Content(schema = @Schema(implementation = xiaozhi.modules.timbre.dto.VoiceCloneResponseDTO.class)))
    })
    @RequiresPermissions("sys:role:normal")
    public Result<VoiceCloneResponseDTO> cloneVoice(@Valid @RequestBody VoiceCloneRequestDTO req) {
        Long userId = SecurityUser.getUserId();
        VoiceCloneResponseDTO dto = ttsCloneService.cloneCreateOrUpdate(userId, req.getSlotId(), req.getFileUrls(), req.getName());
        return new Result<VoiceCloneResponseDTO>().ok(dto);
    }

    @PostMapping(value = "/tts/test/speak", produces = "audio/wav")
    @Operation(summary = "合成测试（返回音频）")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "音频流",
            content = @Content(mediaType = "audio/wav", schema = @Schema(type = "string", format = "binary")))
    })
    @RequiresPermissions("sys:role:normal")
    public ResponseEntity<byte[]> testSpeak(@Valid @RequestBody TtsTestSpeakDTO req) {
        String voiceId = null;
        if (req.getSlotId() != null && !req.getSlotId().isEmpty()) {
            TtsSlotEntity slot = ttsSlotDao.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<TtsSlotEntity>()
                    .eq(TtsSlotEntity::getSlotId, req.getSlotId()));
            if (slot != null) {
                voiceId = slot.getVoiceId();
            }
        }
        if (voiceId == null && req.getTtsVoiceId() != null && !req.getTtsVoiceId().isEmpty()) {
            TimbreDetailsVO timbre = timbreService.get(req.getTtsVoiceId());
            if (timbre != null) voiceId = timbre.getTtsVoice();
        }
        if (voiceId == null) {
            // 兜底：直接使用共享音色ID作为上游voice_id（若用户传入的本就是上游ID）
            voiceId = req.getTtsVoiceId();
        }
        byte[] audio = indexTtsClient.speak(req.getText(), voiceId);
        // 记录测试用量：按文本长度计字符，调用数=1
        Long userId = SecurityUser.getUserId();
        String slotId = req.getSlotId();
        int chars = req.getText() == null ? 0 : req.getText().length();
        ttsUsageService.addUsage(userId, null, "test", chars, 1, 0, slotId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "audio/wav")
                .body(audio);
    }
}
