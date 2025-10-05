package xiaozhi.modules.timbre.dto;

import java.util.Date;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class TtsSlotVO {
    @Schema(description = "音色位业务ID")
    private String slotId;

    @Schema(description = "绑定的TTS模型ID")
    private String ttsModelId;

    @Schema(description = "当前绑定的上游voice_id")
    private String voiceId;

    @Schema(description = "预听地址")
    private String previewUrl;

    @Schema(description = "该音色位允许克隆的总次数，0或null表示不限制")
    private Integer cloneLimit;

    @Schema(description = "该音色位已使用的克隆次数")
    private Integer cloneUsed;

    @Schema(description = "状态：empty|active|disabled")
    private String status;

    @Schema(description = "最近一次克隆时间")
    private Date lastClonedAt;

    @Schema(description = "创建时间")
    private Date createdAt;

    @Schema(description = "更新时间")
    private Date updatedAt;
}
