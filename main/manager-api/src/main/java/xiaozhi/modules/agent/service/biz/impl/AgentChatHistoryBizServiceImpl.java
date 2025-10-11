package xiaozhi.modules.agent.service.biz.impl;

import java.util.Base64;
import java.util.Date;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import xiaozhi.common.constant.Constant;
import xiaozhi.common.redis.RedisKeys;
import xiaozhi.common.redis.RedisUtils;
import xiaozhi.modules.agent.dto.AgentChatHistoryReportDTO;
import xiaozhi.modules.agent.entity.AgentChatHistoryEntity;
import xiaozhi.modules.agent.entity.AgentEntity;
import xiaozhi.modules.agent.service.AgentChatAudioService;
import xiaozhi.modules.agent.service.AgentChatHistoryService;
import xiaozhi.modules.agent.service.AgentService;
import xiaozhi.modules.agent.service.biz.AgentChatHistoryBizService;
import xiaozhi.modules.device.entity.DeviceEntity;
import xiaozhi.modules.device.service.DeviceService;
import xiaozhi.modules.timbre.dao.TtsSlotDao;
import xiaozhi.modules.timbre.entity.TtsSlotEntity;
import xiaozhi.modules.timbre.service.TtsUsageService;

/**
 * {@link AgentChatHistoryBizService} impl
 *
 * @author Goody
 * @version 1.0, 2025/4/30
 * @since 1.0.0
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AgentChatHistoryBizServiceImpl implements AgentChatHistoryBizService {
    private final AgentService agentService;
    private final AgentChatHistoryService agentChatHistoryService;
    private final AgentChatAudioService agentChatAudioService;
    private final RedisUtils redisUtils;
    private final DeviceService deviceService;
    private final TtsUsageService ttsUsageService;
    private final TtsSlotDao ttsSlotDao;

    /**
     * 处理聊天记录上报，包括文件上传和相关信息记录
     *
     * @param report 包含聊天上报所需信息的输入对象
     * @return 上传结果，true表示成功，false表示失败
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean report(AgentChatHistoryReportDTO report) {
        String macAddress = report.getMacAddress();
        Byte chatType = report.getChatType();
        Long reportTimeMillis = null != report.getReportTime() ? report.getReportTime() * 1000 : System.currentTimeMillis();
        log.info("小智设备聊天上报请求: macAddress={}, type={} reportTime={}", macAddress, chatType, reportTimeMillis);

        // 根据设备MAC地址查询对应的默认智能体，判断是否需要上报
        AgentEntity agentEntity = agentService.getDefaultAgentByMacAddress(macAddress);
        if (agentEntity == null) {
            return Boolean.FALSE;
        }

        Integer chatHistoryConf = agentEntity.getChatHistoryConf();
        String agentId = agentEntity.getId();

        if (Objects.equals(chatHistoryConf, Constant.ChatHistoryConfEnum.RECORD_TEXT.getCode())) {
            saveChatText(report, agentId, macAddress, null, reportTimeMillis);
        } else if (Objects.equals(chatHistoryConf, Constant.ChatHistoryConfEnum.RECORD_TEXT_AUDIO.getCode())) {
            String audioId = saveChatAudio(report);
            saveChatText(report, agentId, macAddress, audioId, reportTimeMillis);
        }

        // 计费与用量：仅对智能体输出(=TTS)进行计费与流水写入
        // chatType: 1=用户(ASR) 2=智能体(TTS)
        if (report.getChatType() != null && report.getChatType() == 2) {
            try {
                handleTtsUsage(agentEntity, report);
            } catch (Exception e) {
                log.warn("TTS用量入账失败: agentId={}, mac={}, err={}", agentId, macAddress, e.getMessage());
            }
        }

        // 更新设备最后对话时间
        redisUtils.set(RedisKeys.getAgentDeviceLastConnectedAtById(agentId), new Date());

        // 更新设备最后连接时间
        DeviceEntity device = deviceService.getDeviceByMacAddress(macAddress);
        if (device != null) {
            deviceService.updateDeviceConnectionInfo(agentId, device.getId(), null);
        } else {
            log.warn("聊天记录上报时，未找到mac地址为 {} 的设备", macAddress);
        }

        return Boolean.TRUE;
    }

    /**
     * base64解码report.getOpusDataBase64(),存入ai_agent_chat_audio表
     */
    private String saveChatAudio(AgentChatHistoryReportDTO report) {
        String audioId = null;

        if (report.getAudioBase64() != null && !report.getAudioBase64().isEmpty()) {
            try {
                byte[] audioData = Base64.getDecoder().decode(report.getAudioBase64());
                audioId = agentChatAudioService.saveAudio(audioData);
                log.info("音频数据保存成功，audioId={}", audioId);
            } catch (Exception e) {
                log.error("音频数据保存失败", e);
                return null;
            }
        }
        return audioId;
    }

    /**
     * 组装上报数据
     */
    private void saveChatText(AgentChatHistoryReportDTO report, String agentId, String macAddress, String audioId, Long reportTime) {
        // 构建聊天记录实体
        AgentChatHistoryEntity entity = AgentChatHistoryEntity.builder()
                .macAddress(macAddress)
                .agentId(agentId)
                .sessionId(report.getSessionId())
                .chatType(report.getChatType())
                .content(report.getContent())
                .audioId(audioId)
                .createdAt(new Date(reportTime))
                // NOTE(haotian): 2025/5/26 updateAt可以不设置，重点是createAt，而且这样可以看到上报延迟
                .build();

        // 保存数据
        agentChatHistoryService.save(entity);

        log.info("设备 {} 对应智能体 {} 上报成功", macAddress, agentId);
    }

    /**
     * 写入TTS用量，并根据音色位计费模式(off|count|token|char)更新已用。
     * 逻辑：
     * - usage: endpoint=tts，costCalls=1，costChars=content长度
     * - slot判定：若Agent.ttsVoiceId命中 tts_slot.slot_id，则按该slot的quotaMode计费；否则仅记usage。
     */
    private void handleTtsUsage(AgentEntity agent, AgentChatHistoryReportDTO report) {
        if (agent == null) return;
        Long userId = agent.getUserId();
        String agentId = agent.getId();
        String content = report.getContent();
        int costChars = content == null ? 0 : content.length();
        String slotId = null;

        // 识别是否为slotId（用户私有音色位）
        if (agent.getTtsVoiceId() != null) {
            TtsSlotEntity slot = ttsSlotDao.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<TtsSlotEntity>()
                    .eq(TtsSlotEntity::getSlotId, agent.getTtsVoiceId())
                    .last("limit 1")
            );
            if (slot != null) {
                slotId = slot.getSlotId();
                // 先记usage流水
                ttsUsageService.addUsage(userId, agentId, "tts", costChars, 1, 0, slotId);

                // 再根据计费模式扣减计数
                String mode = slot.getQuotaMode();
                if (mode == null) mode = "off";
                switch (mode) {
                    case "count" -> {
                        Integer used = slot.getTtsCallUsed() == null ? 0 : slot.getTtsCallUsed();
                        slot.setTtsCallUsed(used + 1);
                        slot.setUpdatedAt(new Date());
                        ttsSlotDao.updateById(slot);
                    }
                    case "token", "char" -> {
                        Long used = slot.getTtsTokenUsed() == null ? 0L : slot.getTtsTokenUsed();
                        slot.setTtsTokenUsed(used + Math.max(costChars, 0));
                        slot.setUpdatedAt(new Date());
                        ttsSlotDao.updateById(slot);
                    }
                    default -> {
                        // off：不扣减，仅写usage
                    }
                }
                return; // 已处理slot计费
            }
        }

        // 未命中slot：也写usage，但不更新slot用量
        ttsUsageService.addUsage(userId, agentId, "tts", costChars, 1, 0, null);
    }
}
