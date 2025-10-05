package xiaozhi.modules.timbre.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
@Schema(description = "管理员更新音色位设置")
public class TtsSlotUpdateDTO {
    @Schema(description = "克隆次数上限，0或null表示不限制")
    private Integer cloneLimit;

    @Schema(description = "配额模式：off|count|token")
    private String quotaMode;

    @Schema(description = "当 quotaMode=count 时的每slot调用上限")
    private Integer ttsCallLimit;

    @Schema(description = "当 quotaMode=token 时的每slot token 上限")
    private Long ttsTokenLimit;

    @Schema(description = "状态：empty|active|disabled")
    private String status;
}

