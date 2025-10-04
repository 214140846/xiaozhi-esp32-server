package xiaozhi.modules.timbre.entity;

import java.util.Date;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@TableName("ai_tts_voice_clone")
@Schema(description = "克隆音色历史")
public class TtsVoiceCloneEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String slotId;
    private String voiceId;
    private String name;
    private String status;
    private String previewUrl;
    private String source;
    private Date createdAt;
    private Date updatedAt;
}

