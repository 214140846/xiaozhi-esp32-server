package xiaozhi.modules.timbre.dto;

import java.util.Date;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class TtsSlotVO {
    @Schema(description = "音色位业务ID")
    private String slotId;
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

