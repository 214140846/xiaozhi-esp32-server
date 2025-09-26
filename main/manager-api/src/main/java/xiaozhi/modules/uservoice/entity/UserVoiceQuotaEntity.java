package xiaozhi.modules.uservoice.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@TableName("ai_user_voice_quota")
@Schema(description = "用户音色配额")
public class UserVoiceQuotaEntity {
    @TableId
    private Long userId;

    @Schema(description = "额外槽位")
    private Integer extraSlots;

    @Schema(description = "全局API Key")
    private String apiKey;
}
