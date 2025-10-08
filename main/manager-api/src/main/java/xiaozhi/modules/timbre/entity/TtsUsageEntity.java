package xiaozhi.modules.timbre.entity;

import java.util.Date;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@TableName("tts_usage")
@Schema(description = "TTS用量流水")
public class TtsUsageEntity {
    @TableId(type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "关联的Agent ID，可为空")
    private String agentId;

    @Schema(description = "端点类型：clone|tts（test 已废弃）")
    private String endpoint;

    @Schema(description = "本次消耗的字符数")
    private Integer costChars;

    @Schema(description = "本次消耗的调用次数，一般为1")
    private Integer costCalls;

    @Schema(description = "合成时长毫秒，可为0")
    private Integer durationMs;

    @Schema(description = "关联的音色位ID，可为空")
    private String slotId;

    @Schema(description = "创建时间")
    private Date createdAt;
}
