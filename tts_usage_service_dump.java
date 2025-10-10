package xiaozhi.modules.timbre.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Date;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;

import lombok.AllArgsConstructor;
import xiaozhi.modules.timbre.dao.TtsUsageDao;
import xiaozhi.modules.timbre.entity.TtsUsageEntity;

@Service
@AllArgsConstructor
public class TtsUsageService {
    private final TtsUsageDao ttsUsageDao;

    public void addUsage(Long userId, String agentId, String endpoint, Integer costChars, Integer costCalls,
            Integer durationMs, String slotId) {
        TtsUsageEntity u = new TtsUsageEntity();
        u.setUserId(userId);
        u.setAgentId(agentId);
        u.setEndpoint(endpoint);
        u.setCostChars(costChars == null ? 0 : costChars);
        u.setCostCalls(costCalls == null ? 1 : costCalls);
        u.setDurationMs(durationMs == null ? 0 : durationMs);
        u.setSlotId(slotId);
        u.setCreatedAt(new Date());
        ttsUsageDao.insert(u);
    }

    public List<TtsUsageEntity> listMy(Long userId, String endpoint, String startDate, String endDate, Integer limit) {
        LambdaQueryWrapper<TtsUsageEntity> w = new LambdaQueryWrapper<TtsUsageEntity>()
                .eq(TtsUsageEntity::getUserId, userId)
                .orderByDesc(TtsUsageEntity::getCreatedAt);
        if (StringUtils.isNotBlank(endpoint)) {
            w.eq(TtsUsageEntity::getEndpoint, endpoint);
        }
        // 起止日期过滤（支持 yyyy-MM-dd 或 yyyy-MM-dd HH:mm[:ss]）
        Date start = parseStart(startDate);
        Date end = parseEnd(endDate);
        if (start != null) {
            w.ge(TtsUsageEntity::getCreatedAt, start);
        }
        if (end != null) {
            w.le(TtsUsageEntity::getCreatedAt, end);
        }
        if (limit != null && limit > 0) {
            w.last("limit " + limit);
        }
        return ttsUsageDao.selectList(w);
    }

    public List<TtsUsageEntity> listAdmin(Long userId, String endpoint, String startDate, String endDate,
            Integer limit) {
        LambdaQueryWrapper<TtsUsageEntity> w = new LambdaQueryWrapper<TtsUsageEntity>()
                .orderByDesc(TtsUsageEntity::getCreatedAt);
        if (userId != null) {
            w.eq(TtsUsageEntity::getUserId, userId);
        }
        if (StringUtils.isNotBlank(endpoint)) {
            w.eq(TtsUsageEntity::getEndpoint, endpoint);
        }
        // 起止日期过滤
        Date start = parseStart(startDate);
        Date end = parseEnd(endDate);
        if (start != null) {
            w.ge(TtsUsageEntity::getCreatedAt, start);
        }
        if (end != null) {
            w.le(TtsUsageEntity::getCreatedAt, end);
        }
        if (limit != null && limit > 0) {
            w.last("limit " + limit);
        }
        return ttsUsageDao.selectList(w);
    }

    private Date parseStart(String s) {
        if (StringUtils.isBlank(s)) return null;
        Date d = tryParseDateTime(s);
        if (d != null) return d;
        try {
            LocalDate ld = LocalDate.parse(s, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            LocalDateTime ldt = ld.atStartOfDay();
            return Date.from(ldt.atZone(ZoneId.systemDefault()).toInstant());
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private Date parseEnd(String s) {
        if (StringUtils.isBlank(s)) return null;
        Date d = tryParseDateTime(s);
        if (d != null) return d;
        try {
            LocalDate ld = LocalDate.parse(s, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            LocalDateTime ldt = ld.atTime(23, 59, 59);
            return Date.from(ldt.atZone(ZoneId.systemDefault()).toInstant());
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private Date tryParseDateTime(String s) {
        // 支持 "yyyy-MM-dd HH:mm:ss"、"yyyy-MM-dd HH:mm"、"yyyy-MM-dd'T'HH:mm:ss"
        String[] patterns = new String[] { "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd HH:mm", "yyyy-MM-dd'T'HH:mm:ss" };
        for (String p : patterns) {
            try {
                LocalDateTime ldt = LocalDateTime.parse(s, DateTimeFormatter.ofPattern(p));
                return Date.from(ldt.atZone(ZoneId.systemDefault()).toInstant());
            } catch (DateTimeParseException ignore) {}
        }
        return null;
    }
}

