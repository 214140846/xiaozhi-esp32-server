package xiaozhi.modules.timbre.entity;

import java.util.Date;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@TableName("tts_quota")
@Schema(description = "TTS配额")
public class TtsQuotaEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long charLimit;
    private Long callLimit;
    private Long charUsed;
    private Long callUsed;
    private Integer slots;
    private Date updatedAt;
}

