package xiaozhi.modules.uservoice.dao;

import org.apache.ibatis.annotations.Mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;

import xiaozhi.modules.uservoice.entity.UserVoiceEntity;

@Mapper
public interface UserVoiceDao extends BaseMapper<UserVoiceEntity> {
}

