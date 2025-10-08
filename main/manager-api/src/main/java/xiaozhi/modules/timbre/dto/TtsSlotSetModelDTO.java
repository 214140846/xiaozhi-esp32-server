package xiaozhi.modules.timbre.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "设置音色位模型的请求体")
public class TtsSlotSetModelDTO {
    @Schema(description = "绑定的TTS模型ID", required = true)
    @NotBlank
    private String ttsModelId;

    @Schema(description = "展示名称，可选")
    private String name;
}

