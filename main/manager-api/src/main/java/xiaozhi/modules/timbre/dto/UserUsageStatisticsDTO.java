package xiaozhi.modules.timbre.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "按用户聚合的用量统计")
public class UserUsageStatisticsDTO {
    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "总字符")
    private long totalChars;
    @Schema(description = "总次数")
    private long totalCalls;
    @Schema(description = "TTS 字符")
    private long ttsChars;
    @Schema(description = "TTS 次数")
    private long ttsCalls;
    @Schema(description = "克隆 字符")
    private long cloneChars;
    @Schema(description = "克隆 次数")
    private long cloneCalls;
    @Schema(description = "记录数")
    private long recordCount;
}

