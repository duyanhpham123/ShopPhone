package vn.devpro.shop.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Thông báo khi client còn POST form Thymeleaf cũ (vd. {@code /register}) — dùng JSON API.
 */
@RestController
public class LegacyFormPostNoticeController {

	@PostMapping("/register")
	public ResponseEntity<Map<String, Object>> registerFormDeprecated() {
		return ResponseEntity.badRequest().body(Map.of(
				"success", false,
				"message", "Đăng ký qua POST /api/auth/register với Content-Type: application/json (username, password, passwordRetype, email, mobile)."));
	}

	@PostMapping("/login_processing_url")
	public ResponseEntity<Map<String, Object>> formLoginDeprecated() {
		return ResponseEntity.badRequest().body(Map.of(
				"success", false,
				"message", "Đăng nhập qua POST /api/auth/login JSON (username, password)."));
	}
}
