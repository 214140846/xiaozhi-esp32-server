package xiaozhi.modules.timbre.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "TTS配额更新请求")
public class TtsQuotaUpdateDTO {
    @NotNull
    @Schema(description = "目标用户ID")
    private Long userId;

    @Min(0)
    @Schema(description = "字符额度上限")
    private Long charLimit;

    @Min(0)
    @Schema(description = "调用次数上限")
    private Long callLimit;

    // 可为空表示不限制
    @Min(0)
    @Schema(description = "可用音色位上限，null表示不限制")
    private Integer slots;
}
