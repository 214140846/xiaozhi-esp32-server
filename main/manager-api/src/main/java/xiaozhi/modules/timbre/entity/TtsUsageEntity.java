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
    private Long id;
    private Long userId;
    private String agentId;
    private String endpoint;
    private Integer costChars;
    private Integer costCalls;
    private Integer durationMs;
    private String slotId;
    private Date createdAt;
}

