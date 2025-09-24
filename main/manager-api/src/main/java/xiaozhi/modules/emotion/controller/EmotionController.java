package xiaozhi.modules.emotion.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import xiaozhi.common.utils.Result;
import xiaozhi.modules.emotion.entity.EmotionAssetEntity;
import xiaozhi.modules.emotion.service.EmotionAssetService;

@Tag(name = "表情资源")
@RestController
@RequiredArgsConstructor
@RequestMapping("/emotion")
public class EmotionController {
    private final EmotionAssetService emotionAssetService;

    @GetMapping("/list/agent/{agentId}")
    @Operation(summary = "按智能体查询表情资源")
    @RequiresPermissions("sys:role:normal")
    public Result<List<Map<String, Object>>> listByAgent(@PathVariable String agentId) {
        List<EmotionAssetEntity> list = emotionAssetService.listByAgentId(agentId);
        return new Result<List<Map<String, Object>>>().ok(toVOs(list));
    }

    @GetMapping("/list/by-mac")
    @Operation(summary = "按设备MAC查询表情资源（server）")
    public Result<List<Map<String, Object>>> listByMac(@RequestParam("mac") String mac) {
        List<EmotionAssetEntity> list = emotionAssetService.listByMac(mac);
        return new Result<List<Map<String, Object>>>().ok(toVOs(list));
    }

    @PostMapping("/{agentId}/upload")
    @Operation(summary = "上传表情资源并绑定到指定code")
    @RequiresPermissions("sys:role:normal")
    public Result<Map<String, Object>> uploadAndBind(
            @PathVariable String agentId,
            @RequestParam("code") String code,
            @RequestParam(value = "emoji", required = false) String emoji,
            @RequestParam("file") MultipartFile file) throws IOException, NoSuchAlgorithmException {

        if (file.isEmpty()) {
            return new Result<Map<String, Object>>().error("文件不能为空");
        }
        String originalFilename = file.getOriginalFilename();
        if (StringUtils.isBlank(originalFilename)) {
            return new Result<Map<String, Object>>().error("文件名不能为空");
        }

        String extension = originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase() : "";
        // 允许常见图片与动图
        if (!List.of(".gif", ".png", ".jpg", ".jpeg", ".webp", ".bmp").contains(extension)) {
            return new Result<Map<String, Object>>().error("仅支持图片文件：gif/png/jpg/jpeg/webp/bmp");
        }

        String uploadDir = Paths.get("uploadfile", "emotions").toString();
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String md5 = calculateMD5(file.getBytes());
        String fileName = md5 + extension;
        Path dest = uploadPath.resolve(fileName);
        if (!Files.exists(dest)) {
            Files.copy(file.getInputStream(), dest);
        }

        String contentType = file.getContentType();
        long fileSize = Files.size(dest);
        EmotionAssetEntity saved = emotionAssetService.upsert(agentId, code, emoji, dest.toString(), fileSize, contentType);
        return new Result<Map<String, Object>>().ok(toVO(saved));
    }

    @GetMapping("/download/{id}")
    @Operation(summary = "下载表情资源（匿名）")
    public ResponseEntity<byte[]> download(@PathVariable String id) throws IOException {
        EmotionAssetEntity e = emotionAssetService.selectById(id);
        if (e == null || StringUtils.isBlank(e.getFilePath())) {
            return ResponseEntity.notFound().build();
        }
        Path path = Paths.get(e.getFilePath());
        if (!path.isAbsolute()) {
            path = Paths.get(System.getProperty("user.dir"), e.getFilePath());
        }
        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }
        byte[] body = Files.readAllBytes(path);
        String name = (e.getCode() != null ? e.getCode() : e.getId()) + guessExt(e.getFilePath());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(safeContentType(e.getContentType())))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + name + "\"")
                .body(body);
    }

    private static String calculateMD5(byte[] data) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] digest = md.digest(data);
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private static String guessExt(String path) {
        int i = path.lastIndexOf('.');
        return i >= 0 ? path.substring(i) : "";
    }

    private static String safeContentType(String ct) {
        return StringUtils.isBlank(ct) ? MediaType.APPLICATION_OCTET_STREAM_VALUE : ct;
    }

    private static Map<String, Object> toVO(EmotionAssetEntity e) {
        return Map.of(
                "id", e.getId(),
                "code", e.getCode(),
                "emoji", e.getEmoji() == null ? "" : e.getEmoji(),
                "url", "/emotion/download/" + e.getId(),
                "fileSize", e.getFileSize()
        );
    }

    private static List<Map<String, Object>> toVOs(List<EmotionAssetEntity> list) {
        return list.stream().map(EmotionController::toVO).collect(Collectors.toList());
    }
}
