package xiaozhi.modules.timbre.dao;

import org.apache.ibatis.annotations.Mapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import xiaozhi.modules.timbre.entity.TtsUsageEntity;

@Mapper
public interface TtsUsageDao extends BaseMapper<TtsUsageEntity> {
}

