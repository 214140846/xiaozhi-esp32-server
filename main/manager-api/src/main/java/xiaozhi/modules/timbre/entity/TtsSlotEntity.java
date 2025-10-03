package xiaozhi.modules.timbre.entity;

import java.util.Date;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@TableName("tts_slot")
@Schema(description = "音色位")
public class TtsSlotEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String slotId;
    private Long userId;
    private String ttsModelId;
    private String voiceId;
    private String previewUrl;
    private Integer cloneLimit;
    private Integer cloneUsed;
    private String status;
    private Date lastClonedAt;
    private Date createdAt;
    private Date updatedAt;
}

