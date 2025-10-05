package xiaozhi.modules.timbre.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TtsTestSpeakDTO {
    @NotBlank
    @Schema(description = "要合成的文本内容")
    private String text;

    @Schema(description = "音色位业务ID，优先于ttsVoiceId")
    private String slotId;

    @Schema(description = "共享音色ID(ai_tts_voice.id)，备用")
    private String ttsVoiceId;
}
