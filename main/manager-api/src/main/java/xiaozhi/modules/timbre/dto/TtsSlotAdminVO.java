package xiaozhi.modules.timbre.dto;

import java.util.Date;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "管理员查看音色位VO")
public class TtsSlotAdminVO {
    @Schema(description = "所属用户ID")
    private Long userId;
    @Schema(description = "音色位业务ID")
    private String slotId;

    @Schema(description = "绑定的TTS模型ID")
    private String ttsModelId;

    @Schema(description = "当前绑定的上游voice_id")
    private String voiceId;

    @Schema(description = "展示名称")
    private String name;

    @Schema(description = "预听地址")
    private String previewUrl;

    @Schema(description = "配额模式：off|count|token|char")
    private String quotaMode;

    @Schema(description = "当 quotaMode=count 时的每slot调用上限")
    private Integer ttsCallLimit;

    @Schema(description = "当 quotaMode=token 时的每slot token 上限")
    private Long ttsTokenLimit;

    @Schema(description = "克隆次数上限，0或null表示不限制")
    private Integer cloneLimit;

    @Schema(description = "已使用的克隆次数")
    private Integer cloneUsed;

    @Schema(description = "状态：empty|active|disabled|public")
    private String status;

    @Schema(description = "创建时间")
    private Date createdAt;

    @Schema(description = "更新时间")
    private Date updatedAt;
}
