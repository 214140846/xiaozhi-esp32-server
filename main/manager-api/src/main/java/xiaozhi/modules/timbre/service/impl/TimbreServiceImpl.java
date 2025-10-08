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

        // 仅排除“他人的私有音色”，保留“当前用户的私有音色”
        // 说明：镜像的私有音色以 tts_slot.slot_id 作为 timbre.id；此前直接 not in 全量 slot_id，
        // 会让自己的私有音色也不可见。这里按用户过滤：仅排除 user_id != 当前用户 的 slot。
        try {
            Long uid = xiaozhi.modules.security.user.SecurityUser.getUserId();
            if (uid != null) {
                String subSql = "select slot_id from tts_slot where user_id is not null and user_id <> " + uid;
                queryWrapper.notInSql("id", subSql);
            } else {
                // 未拿到用户ID时，保守起见排除所有 slot 对应的镜像音色
                queryWrapper.notInSql("id", "select slot_id from tts_slot");
            }
        } catch (Exception ignore) {
            // 兜底：任何异常时，仍旧排除所有 slot 对应的镜像音色，避免越权泄露
            queryWrapper.notInSql("id", "select slot_id from tts_slot");
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
