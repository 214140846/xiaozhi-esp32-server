package xiaozhi.modules.timbre.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class VoiceCloneResponseDTO {
    @Schema(description = "上游返回的voice_id")
    private String voiceId;

    @Schema(description = "成功接受的音频文件数，用于计费与克隆次数统计")
    private Integer filesAccepted;

    @Schema(description = "被跳过的音频文件数（重复或不合规）")
    private Integer filesSkipped;

    @Schema(description = "上游返回的预听地址，可在前端直接播放")
    private String previewUrl;

    @Schema(description = "本次写入或更新的音色位ID")
    private String slotId;

    @Schema(description = "音色位已用克隆次数")
    private Integer cloneUsed;

    @Schema(description = "音色位克隆次数上限，0或null代表不限制")
    private Integer cloneLimit;
}
