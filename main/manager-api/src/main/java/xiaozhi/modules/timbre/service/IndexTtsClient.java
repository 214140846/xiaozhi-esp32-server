package xiaozhi.modules.timbre.service;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import lombok.AllArgsConstructor;
import lombok.Data;
import xiaozhi.common.exception.RenException;
import xiaozhi.modules.sys.service.SysParamsService;

@Component
@AllArgsConstructor
public class IndexTtsClient {
    private final RestTemplate restTemplate;
    private final SysParamsService sysParamsService;

    private String baseUrl() {
        String base = sysParamsService.getValue("indextts.base_url", true);
        if (base == null || base.equals("null") || base.isEmpty()) {
            throw new RenException("未配置 indextts.base_url");
        }
        return base;
    }

    private HttpHeaders authHeaders(MediaType accept) {
        String key = sysParamsService.getValue("indextts.api_key", true);
        HttpHeaders headers = new HttpHeaders();
        if (accept != null) headers.setAccept(List.of(accept));
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (key != null && !"null".equals(key) && !key.isEmpty()) {
            headers.set("Authorization", "Bearer " + key);
        }
        return headers;
    }

    private int timeoutMs() {
        try {
            String v = sysParamsService.getValue("indextts.timeout_ms", true);
            if (v == null || v.equals("null") || v.isEmpty()) return 10000;
            int t = Integer.parseInt(v);
            if (t < 1000) t = 1000;
            if (t > 60000) t = 60000;
            return t;
        } catch (Exception e) {
            return 10000;
        }
    }

    private RestTemplate buildClientWithTimeout() {
        int t = timeoutMs();
        SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
        f.setConnectTimeout(t);
        f.setReadTimeout(t);
        return new RestTemplate(f);
    }

    @Data
    public static class CloneResult {
        private String voice_id;
        private Integer files_accepted;
        private Integer files_skipped;
        private String preview_url;
    }

    public CloneResult cloneVoice(List<String> uploadUrls) {
        String url = baseUrl() + "/voices/clone";
        Map<String, Object> body = new HashMap<>();
        body.put("upload_urls", uploadUrls);
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, authHeaders(MediaType.APPLICATION_JSON));
        ResponseEntity<CloneResult> resp = buildClientWithTimeout().exchange(url, HttpMethod.POST, req, CloneResult.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new RenException("克隆调用失败: " + resp.getStatusCode());
        }
        CloneResult cr = resp.getBody();
        // 如果没有返回 voice_id，则视为失败（不写库）
        if (cr.getVoice_id() == null || cr.getVoice_id().isEmpty()) {
            throw new RenException("克隆接口返回异常：未包含voice_id");
        }
        return cr;
    }

    public byte[] speak(String text, String voiceId) {
        String url = baseUrl() + "/tts";
        Map<String, Object> body = new HashMap<>();
        body.put("text", text);
        body.put("voice_id", voiceId);
        HttpEntity<String> req = new HttpEntity<>(JsonUtilsCompat.toJson(body), authHeaders(MediaType.valueOf("audio/wav")));
        ResponseEntity<byte[]> resp = buildClientWithTimeout().exchange(url, HttpMethod.POST, req, byte[].class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new RenException("合成调用失败: " + resp.getStatusCode());
        }
        return resp.getBody();
    }

    // 简易JSON序列化以避开依赖
    static class JsonUtilsCompat {
        static String toJson(Map<String, Object> map) {
            StringBuilder sb = new StringBuilder();
            sb.append('{');
            boolean first = true;
            for (Map.Entry<String, Object> e : map.entrySet()) {
                if (!first) sb.append(',');
                first = false;
                sb.append('"').append(escape(e.getKey())).append('"').append(':');
                Object v = e.getValue();
                if (v == null) {
                    sb.append("null");
                } else if (v instanceof Number || v instanceof Boolean) {
                    sb.append(v);
                } else {
                    sb.append('"').append(escape(String.valueOf(v))).append('"');
                }
            }
            sb.append('}');
            return sb.toString();
        }

        static String escape(String s) {
            return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
        }
    }
}
