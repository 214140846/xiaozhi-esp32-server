package xiaozhi.modules.emotion.service.impl;

import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;

import lombok.RequiredArgsConstructor;
import xiaozhi.common.service.impl.BaseServiceImpl;
import xiaozhi.modules.agent.entity.AgentEntity;
import xiaozhi.modules.agent.service.AgentService;
import xiaozhi.modules.device.entity.DeviceEntity;
import xiaozhi.modules.device.service.DeviceService;
import xiaozhi.modules.emotion.dao.EmotionAssetDao;
import xiaozhi.modules.emotion.entity.EmotionAssetEntity;
import xiaozhi.modules.emotion.service.EmotionAssetService;

@Service
@RequiredArgsConstructor
public class EmotionAssetServiceImpl extends BaseServiceImpl<EmotionAssetDao, EmotionAssetEntity>
        implements EmotionAssetService {

    private final AgentService agentService;
    private final DeviceService deviceService;

    @Override
    public List<EmotionAssetEntity> listByAgentId(String agentId) {
        QueryWrapper<EmotionAssetEntity> qw = new QueryWrapper<>();
        qw.eq("agent_id", agentId).orderByAsc("code");
        return baseDao.selectList(qw);
    }

    @Override
    public EmotionAssetEntity upsert(String agentId, String code, String emoji, String filePath, long fileSize, String contentType) {
        QueryWrapper<EmotionAssetEntity> qw = new QueryWrapper<>();
        qw.eq("agent_id", agentId).eq("code", code);
        EmotionAssetEntity exist = baseDao.selectOne(qw);
        Date now = new Date();
        if (exist == null) {
            EmotionAssetEntity e = new EmotionAssetEntity();
            e.setAgentId(agentId);
            e.setCode(code);
            e.setEmoji(emoji);
            e.setFilePath(filePath);
            e.setFileSize(fileSize);
            e.setContentType(contentType);
            e.setCreateDate(now);
            e.setUpdateDate(now);
            baseDao.insert(e);
            return e;
        } else {
            exist.setEmoji(emoji);
            exist.setFilePath(filePath);
            exist.setFileSize(fileSize);
            exist.setContentType(contentType);
            exist.setUpdateDate(now);
            baseDao.updateById(exist);
            return exist;
        }
    }

    @Override
    public List<EmotionAssetEntity> listByMac(String macAddress) {
        DeviceEntity device = deviceService.getDeviceByMacAddress(macAddress);
        if (device == null) {
            return List.of();
        }
        AgentEntity agent = agentService.selectById(device.getAgentId());
        if (agent == null) {
            return List.of();
        }
        return listByAgentId(agent.getId());
    }
}

