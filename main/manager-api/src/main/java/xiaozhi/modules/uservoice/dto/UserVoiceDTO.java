package xiaozhi.modules.uservoice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "用户音色更新")
public class UserVoiceDTO {
    @Schema(description = "音色名称")
    @NotBlank(message = "{user.voice.name.require}")
    private String name;

    @Schema(description = "音色文件URL，可选")
    private String tosUrl;
}
