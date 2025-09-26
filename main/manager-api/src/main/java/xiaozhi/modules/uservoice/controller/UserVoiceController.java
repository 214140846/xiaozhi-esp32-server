package xiaozhi.modules.uservoice.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.apache.shiro.authz.annotation.Logical;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import xiaozhi.common.utils.Result;
import xiaozhi.modules.security.user.SecurityUser;
import xiaozhi.modules.uservoice.dto.UserVoiceDTO;
import xiaozhi.modules.uservoice.entity.UserVoiceEntity;
import xiaozhi.modules.uservoice.service.UserVoiceService;

@Tag(name = "用户音色")
@RestController
@RequiredArgsConstructor
@RequestMapping("/userVoice")
public class UserVoiceController {
    private static final int DEFAULT_SLOTS = 5;
    private final UserVoiceService userVoiceService;

    @GetMapping("/list")
    @Operation(summary = "我的音色列表")
    @RequiresPermissions(value = {"sys:role:normal", "sys:role:superAdmin"}, logical = Logical.OR)
    public Result<List<UserVoiceEntity>> list() {
        Long uid = SecurityUser.getUserId();
        return new Result<List<UserVoiceEntity>>().ok(userVoiceService.listByUser(uid));
    }

    @GetMapping("/quota")
    @Operation(summary = "我的音色配额")
    @RequiresPermissions(value = {"sys:role:normal", "sys:role:superAdmin"}, logical = Logical.OR)
    public Result<Map<String, Object>> quota() {
        Long uid = SecurityUser.getUserId();
        int used = userVoiceService.countByUser(uid);
        int extra = userVoiceService.getExtraSlots(uid);
        Map<String, Object> m = new HashMap<>();
        m.put("default", DEFAULT_SLOTS);
        m.put("extra", extra);
        m.put("total", DEFAULT_SLOTS + extra);
        m.put("used", used);
        return new Result<Map<String, Object>>().ok(m);
    }

    @PutMapping("/quota/{userId}")
    @Operation(summary = "设置用户额外音色位（管理员）")
    @RequiresPermissions("sys:role:superAdmin")
    public Result<Void> setQuota(@PathVariable Long userId, @RequestParam("extra") int extra) {
        userVoiceService.setExtraSlots(userId, Math.max(0, extra));
        return new Result<>();
    }

    @PostMapping("/upload")
    @Operation(summary = "上传音色（wav）")
    @RequiresPermissions(value = {"sys:role:normal", "sys:role:superAdmin"}, logical = Logical.OR)
    public Result<UserVoiceEntity> upload(@RequestParam("file") MultipartFile file,
            @RequestParam("name") String name) throws IOException {
        Long uid = SecurityUser.getUserId();
        int used = userVoiceService.countByUser(uid);
        int total = DEFAULT_SLOTS + userVoiceService.getExtraSlots(uid);
        if (used >= total) {
            return new Result<UserVoiceEntity>().error("音色位已用满，请购买或由管理员分配额外音色位");
        }
        if (file.isEmpty()) {
            return new Result<UserVoiceEntity>().error("文件不能为空");
        }
        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains(".")) ? original.substring(original.lastIndexOf('.')).toLowerCase() : "";
        if (!".wav".equals(ext)) {
            return new Result<UserVoiceEntity>().error("仅支持 WAV 文件");
        }
        String dir = Paths.get("uploadfile", "user_voices").toString();
        Files.createDirectories(Paths.get(dir));
        String id = UUID.randomUUID().toString().replace("-", "");
        String filename = id + ext;
        Path dest = Paths.get(dir, filename);
        Files.copy(file.getInputStream(), dest);
        UserVoiceEntity e = new UserVoiceEntity();
        e.setId(id);
        e.setUserId(uid);
        e.setName(name);
        e.setTosUrl("/userVoice/download/" + id);
        e.setEnabled(1);
        userVoiceService.insert(e);
        return new Result<UserVoiceEntity>().ok(e);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新音色名称/API Key")
    @RequiresPermissions(value = {"sys:role:normal", "sys:role:superAdmin"}, logical = Logical.OR)
    public Result<Void> update(@PathVariable String id, @Valid @RequestBody UserVoiceDTO dto) {
        Long uid = SecurityUser.getUserId();
        UserVoiceEntity e = userVoiceService.selectById(id);
        if (e == null || !uid.equals(e.getUserId())) {
            return new Result<Void>().error("无权操作");
        }
        e.setName(dto.getName());
        userVoiceService.updateById(e);
        return new Result<>();
    }

    @GetMapping("/settings")
    @Operation(summary = "获取全局API Key")
    @RequiresPermissions(value = {"sys:role:normal", "sys:role:superAdmin"}, logical = Logical.OR)
    public Result<Map<String, Object>> getSettings() {
        Long uid = SecurityUser.getUserId();
        String apiKey = userVoiceService.getUserApiKey(uid);
        Map<String, Object> m = new HashMap<>();
        m.put("apiKey", apiKey);
        return new Result<Map<String, Object>>().ok(m);
    }

    @PutMapping("/settings")
    @Operation(summary = "设置全局API Key")
    @RequiresPermissions(value = {"sys:role:normal", "sys:role:superAdmin"}, logical = Logical.OR)
    public Result<Void> setSettings(@RequestBody Map<String, String> body) {
        Long uid = SecurityUser.getUserId();
        String apiKey = body == null ? null : body.get("apiKey");
        userVoiceService.setUserApiKey(uid, apiKey);
        return new Result<>();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除音色")
    @RequiresPermissions(value = {"sys:role:normal", "sys:role:superAdmin"}, logical = Logical.OR)
    public Result<Void> delete(@PathVariable String id) throws IOException {
        Long uid = SecurityUser.getUserId();
        UserVoiceEntity e = userVoiceService.selectById(id);
        if (e == null || !uid.equals(e.getUserId())) {
            return new Result<Void>().error("无权操作");
        }
        // 删除本地文件（若存在）
        if (e.getTosUrl() != null && e.getTosUrl().startsWith("/userVoice/download/")) {
            Path p = Paths.get("uploadfile", "user_voices", id + ".wav");
            Files.deleteIfExists(p);
        }
        userVoiceService.deleteById(id);
        return new Result<>();
    }

    @GetMapping("/download/{id}")
    @Operation(summary = "下载（匿名）")
    public ResponseEntity<byte[]> download(@PathVariable String id) throws IOException {
        Path path = Paths.get("uploadfile", "user_voices", id + ".wav");
        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }
        byte[] body = Files.readAllBytes(path);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/wav"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"voice_" + id + ".wav\"")
                .body(body);
    }
}
