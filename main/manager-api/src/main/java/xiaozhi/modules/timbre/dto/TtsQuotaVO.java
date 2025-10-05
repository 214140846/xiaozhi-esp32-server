package xiaozhi.modules.timbre.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "TTS配额视图")
public class TtsQuotaVO {
    @Schema(description = "字符额度上限")
    private Long charLimit;
    @Schema(description = "调用次数上限")
    private Long callLimit;
    @Schema(description = "已用字符数")
    private Long charUsed;
    @Schema(description = "已用调用次数")
    private Long callUsed;
    @Schema(description = "可用音色位上限，null表示不限制")
    private Integer slots;       // 配置的音色位上限
    @Schema(description = "当前已占用的音色位数")
    private Integer slotsUsed;   // 当前已占用音色位数
    @Schema(description = "剩余可用的音色位数")
    private Integer slotsRemain; // 剩余可用音色位
}
