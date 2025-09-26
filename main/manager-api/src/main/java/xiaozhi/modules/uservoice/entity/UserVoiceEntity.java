package xiaozhi.modules.uservoice.entity;

import java.util.Date;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@TableName("ai_user_voice_slot")
@Schema(description = "用户自定义音色槽位")
public class UserVoiceEntity {
    @Schema(description = "主键")
    private String id;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "音色名称")
    private String name;

    @Schema(description = "TOS链接或可下载URL")
    private String tosUrl;

    @Schema(description = "API Key")
    private String apiKey;

    @Schema(description = "是否启用")
    private Integer enabled;

    @Schema(description = "备注")
    private String remark;

    @Schema(description = "排序")
    private Integer sort;

    @TableField(fill = FieldFill.UPDATE)
    private Long updater;

    @TableField(fill = FieldFill.UPDATE)
    private Date updateDate;

    @TableField(fill = FieldFill.INSERT)
    private Long creator;

    @TableField(fill = FieldFill.INSERT)
    private Date createDate;
}

