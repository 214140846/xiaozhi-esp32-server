package xiaozhi.modules.timbre.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "TTS配额视图")
public class TtsQuotaVO {
    // 总量配额（字符/调用），供后续扩展或管理员查看
    @Schema(description = "总字符额度")
    private Long charLimit;

    @Schema(description = "总调用次数额度")
    private Long callLimit;

    @Schema(description = "已用字符")
    private Long charUsed;

    @Schema(description = "已用调用次数")
    private Long callUsed;

    // 音色位额度（按用户维度）
    @Schema(description = "音色位上限（旧字段名：slots）")
    private Integer slots; // 兼容旧接口：TtsQuotaController 使用

    @Schema(description = "已使用音色位数量")
    private Integer slotsUsed;

    @Schema(description = "剩余可用音色位（旧字段名：slotsRemain）")
    private Integer slotsRemain;

    // 新字段别名：便于前端更语义化读取
    @Schema(description = "音色位上限（别名）")
    private Integer slotsLimit;

    @Schema(description = "剩余可用音色位（别名）")
    private Integer slotsRemaining;
}
