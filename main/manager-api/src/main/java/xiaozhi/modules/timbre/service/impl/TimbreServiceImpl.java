package xiaozhi.modules.timbre.service.impl;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;

import cn.hutool.core.collection.CollectionUtil;
import lombok.AllArgsConstructor;
import xiaozhi.common.constant.Constant;
import xiaozhi.common.page.PageData;
import xiaozhi.common.redis.RedisKeys;
import xiaozhi.common.redis.RedisUtils;
import xiaozhi.common.service.impl.BaseServiceImpl;
import xiaozhi.common.utils.ConvertUtils;
import xiaozhi.modules.model.dto.VoiceDTO;
import xiaozhi.modules.timbre.dao.TimbreDao;
import xiaozhi.modules.timbre.dto.TimbreDataDTO;
import xiaozhi.modules.timbre.dto.TimbrePageDTO;
import xiaozhi.modules.timbre.entity.TimbreEntity;
import xiaozhi.modules.timbre.service.TimbreService;
import xiaozhi.modules.timbre.vo.TimbreDetailsVO;

/**
 * 音色的业务层的实现
 * 
 * @author zjy
 * @since 2025-3-21
 */
@AllArgsConstructor
@Service
public class TimbreServiceImpl extends BaseServiceImpl<TimbreDao, TimbreEntity> implements TimbreService {

    private final TimbreDao timbreDao;
    private final RedisUtils redisUtils;

    @Override
    public PageData<TimbreDetailsVO> page(TimbrePageDTO dto) {
        Map<String, Object> params = new HashMap<String, Object>();
        params.put(Constant.PAGE, dto.getPage());
        params.put(Constant.LIMIT, dto.getLimit());
        IPage<TimbreEntity> page = baseDao.selectPage(
                getPage(params, null, true),
                // 定义查询条件
                new QueryWrapper<TimbreEntity>()
                        // 必须按照ttsID查找
                        .eq("tts_model_id", dto.getTtsModelId())
                        // 如果有音色名字，按照音色名模糊查找
                        .like(StringUtils.isNotBlank(dto.getName()), "name", dto.getName()));

        return getPageData(page, TimbreDetailsVO.class);
    }

    @Override
    public TimbreDetailsVO get(String timbreId) {
        if (StringUtils.isBlank(timbreId)) {
            return null;
        }

        // 先从Redis获取缓存
        String key = RedisKeys.getTimbreDetailsKey(timbreId);
        TimbreDetailsVO cachedDetails = (TimbreDetailsVO) redisUtils.get(key);
        if (cachedDetails != null) {
            return cachedDetails;
        }

        // 如果缓存中没有，则从数据库获取
        TimbreEntity entity = baseDao.selectById(timbreId);
        if (entity == null) {
            return null;
        }

        // 转换为VO对象
        TimbreDetailsVO details = ConvertUtils.sourceToTarget(entity, TimbreDetailsVO.class);

        // 存入Redis缓存
        if (details != null) {
            redisUtils.set(key, details);
        }

        return details;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void save(TimbreDataDTO dto) {
        isTtsModelId(dto.getTtsModelId());
        TimbreEntity timbreEntity = ConvertUtils.sourceToTarget(dto, TimbreEntity.class);
        baseDao.insert(timbreEntity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(String timbreId, TimbreDataDTO dto) {
        isTtsModelId(dto.getTtsModelId());
        TimbreEntity timbreEntity = ConvertUtils.sourceToTarget(dto, TimbreEntity.class);
        timbreEntity.setId(timbreId);
        baseDao.updateById(timbreEntity);
        // 删除缓存
        redisUtils.delete(RedisKeys.getTimbreDetailsKey(timbreId));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(String[] ids) {
        baseDao.deleteBatchIds(Arrays.asList(ids));
    }

    @Override
    public List<VoiceDTO> getVoiceNames(String ttsModelId, String voiceName) {
        QueryWrapper<TimbreEntity> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("tts_model_id", StringUtils.isBlank(ttsModelId) ? "" : ttsModelId);

        // 注意：公开到共享库的音色存储在 ai_tts_voice
        // 音色分为两类：
        // 1) 管理员直接创建的共享音色（非 slot 镜像），对所有用户可见
        // 2) 用户音色位镜像（通过 slot 创建），需要权限控制
        // 权限逻辑：
        // - 管理员创建的共享音色：对所有用户可见（不在 tts_slot 表中的记录）
        // - 当前用户的音色位镜像：对自己可见
        // - 其他用户已公开的音色位镜像：对所有人可见（tts_slot.status = 'public'）
        // - 其他用户未公开的音色位镜像：对其他人不可见
        try {
            Long uid = xiaozhi.modules.security.user.SecurityUser.getUserId();
            if (uid != null) {
                // 登录用户：显示所有非音色位镜像 + 当前用户的音色位镜像 + 已公开的音色位镜像
                // 使用原生SQL来实现复杂的OR条件逻辑
                queryWrapper.apply(
                    "(NOT EXISTS (SELECT 1 FROM tts_slot WHERE tts_slot.slot_id = ai_tts_voice.id) " +
                    "OR EXISTS (SELECT 1 FROM tts_slot WHERE tts_slot.slot_id = ai_tts_voice.id AND tts_slot.user_id = {0}) " +
                    "OR EXISTS (SELECT 1 FROM tts_slot WHERE tts_slot.slot_id = ai_tts_voice.id AND tts_slot.status = 'public'))", uid
                );
            } else {
                // 未登录用户：只显示管理员创建的共享音色 + 已公开的音色位镜像
                queryWrapper.apply(
                    "(NOT EXISTS (SELECT 1 FROM tts_slot WHERE tts_slot.slot_id = ai_tts_voice.id) " +
                    "OR EXISTS (SELECT 1 FROM tts_slot WHERE tts_slot.slot_id = ai_tts_voice.id AND tts_slot.status = 'public'))"
                );
            }
        } catch (Exception e) {
            // 如果获取用户信息失败，默认只显示管理员创建的共享音色
            queryWrapper.notExists("SELECT 1 FROM tts_slot WHERE tts_slot.slot_id = ai_tts_voice.id");
        }

        if (StringUtils.isNotBlank(voiceName)) {
            queryWrapper.like("name", voiceName);
        }
        List<TimbreEntity> timbreEntities = timbreDao.selectList(queryWrapper);
        if (CollectionUtil.isEmpty(timbreEntities)) {
            return null;
        }

        return ConvertUtils.sourceToTarget(timbreEntities, VoiceDTO.class);
    }

    /**
     * 处理是不是tts模型的id
     */
    private void isTtsModelId(String ttsModelId) {
        // 等模型配置那边写好调用方法判断
    }

    @Override
    public String getTimbreNameById(String id) {
        if (StringUtils.isBlank(id)) {
            return null;
        }

        String cachedName = (String) redisUtils.get(RedisKeys.getTimbreNameById(id));

        if (StringUtils.isNotBlank(cachedName)) {
            return cachedName;
        }

        TimbreEntity entity = timbreDao.selectById(id);
        if (entity != null) {
            String name = entity.getName();
            if (StringUtils.isNotBlank(name)) {
                redisUtils.set(RedisKeys.getTimbreNameById(id), name);
            }
            return name;
        }

        return null;
    }
}
