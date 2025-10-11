package xiaozhi.modules.timbre.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "TTS用量统计汇总")
public class TtsUsageStatisticsDTO {
    @Schema(description = "总字符数")
    private long totalChars;
    @Schema(description = "总调用次数")
    private long totalCalls;
    @Schema(description = "总时长(毫秒)")
    private long totalDuration;

    @Schema(description = "克隆字符数")
    private long cloneChars;
    @Schema(description = "克隆调用次数")
    private long cloneCalls;

    @Schema(description = "TTS字符数")
    private long ttsChars;
    @Schema(description = "TTS调用次数")
    private long ttsCalls;

    @Schema(description = "记录条数")
    private long recordCount;

    // 成本字段预留
    @Schema(description = "总成本")
    private double totalCost;
    @Schema(description = "克隆成本")
    private double cloneCost;
    @Schema(description = "TTS成本")
    private double ttsCost;
}

