package xiaozhi.modules.timbre.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class VoiceCloneResponseDTO {
    @Schema(description = "上游voice_id")
    private String voiceId;
    private Integer filesAccepted;
    private Integer filesSkipped;
    private String previewUrl;
    private String slotId;
    private Integer cloneUsed;
    private Integer cloneLimit;
}

