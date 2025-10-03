package xiaozhi.modules.timbre.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class VoiceCloneRequestDTO {
    @Schema(description = "音色位业务ID，首次克隆可不填，后续复克隆必填")
    private String slotId;

    @Schema(description = "音频URL列表")
    @NotEmpty
    private List<String> fileUrls;

    @Schema(description = "名称，可选")
    private String name;
}
