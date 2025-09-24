package xiaozhi.modules.emotion.entity;

import java.util.Date;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableName;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@TableName("ai_agent_emotion_asset")
@Schema(description = "智能体表情资源")
public class EmotionAssetEntity {
    @TableId(type = IdType.ASSIGN_UUID)
    @Schema(description = "主键ID")
    private String id;

    @Schema(description = "智能体ID")
    private String agentId;

    @Schema(description = "表情编码，如 happy/angry 等")
    private String code;

    @Schema(description = "emoji 符号，可选")
    private String emoji;

    @Schema(description = "存储路径，相对或绝对路径")
    private String filePath;

    @Schema(description = "文件大小字节")
    private Long fileSize;

    @Schema(description = "内容类型，如 image/gif,image/png")
    private String contentType;

    @TableField(fill = FieldFill.INSERT)
    private Date createDate;

    @TableField(fill = FieldFill.UPDATE)
    private Date updateDate;
}

