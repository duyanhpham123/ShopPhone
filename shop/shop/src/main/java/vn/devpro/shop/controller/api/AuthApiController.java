package vn.devpro.shop.controller.api;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import vn.devpro.shop.model.Role;
import vn.devpro.shop.model.User;
import vn.devpro.shop.service.RoleService;
import vn.devpro.shop.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthApiController {

	private final AuthenticationManager authenticationManager;
	private final UserService userService;
	private final RoleService roleService;
	private final PasswordEncoder passwordEncoder;

	public AuthApiController(
			AuthenticationManager authenticationManager,
			UserService userService,
			RoleService roleService,
			PasswordEncoder passwordEncoder) {
		this.authenticationManager = authenticationManager;
		this.userService = userService;
		this.roleService = roleService;
		this.passwordEncoder = passwordEncoder;
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
		try {
			Authentication authentication = authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(request.username(), request.password()));

			SecurityContext context = SecurityContextHolder.createEmptyContext();
			context.setAuthentication(authentication);
			SecurityContextHolder.setContext(context);

			HttpSession session = httpRequest.getSession(true);
			session.setAttribute("SPRING_SECURITY_CONTEXT", context);

			List<String> roles = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();

			return ResponseEntity.ok(Map.of(
					"authenticated", true,
					"username", authentication.getName(),
					"roles", roles));
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("authenticated", false, "message", "Sai tai khoan hoac mat khau"));
		}
	}

	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
		if (req.username() == null || req.username().isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Thieu username"));
		}
		if (req.password() == null || req.password().length() < 6) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Mat khau it nhat 6 ky tu"));
		}
		if (req.passwordRetype() == null || !req.passwordRetype().equals(req.password())) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Xac nhan mat khau khong khop"));
		}
		if (req.email() == null || req.email().isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Thieu email"));
		}

		if (userService.findByUsername(req.username().trim()) != null) {
			return ResponseEntity.status(HttpStatus.CONFLICT)
					.body(Map.of("success", false, "message", "Username da ton tai"));
		}

		Role role = roleService.findByName("CUSTOMER");
		if (role == null) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("success", false, "message", "Chua cau hinh role CUSTOMER trong DB"));
		}

		User user = new User();
		user.setId(null);
		user.setUsername(req.username().trim());
		user.setPassword(passwordEncoder.encode(req.password()));
		user.setEmail(req.email().trim());
		user.setMobile(req.mobile() != null ? req.mobile().trim() : "");
		user.setCreateDate(LocalDate.now());
		user.setStatus(Boolean.TRUE);
		user.addRelationalUserRole(role);
		userService.create(user);

		return ResponseEntity.ok(Map.of(
				"success", true,
				"message", "Dang ky thanh cong",
				"username", user.getUsername()));
	}

	@GetMapping("/me")
	public ResponseEntity<?> me(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()
				|| authentication instanceof AnonymousAuthenticationToken) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("authenticated", false));
		}

		List<String> roles = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
		return ResponseEntity.ok(Map.of(
				"authenticated", true,
				"username", authentication.getName(),
				"roles", roles));
	}

	@PostMapping("/logout")
	public ResponseEntity<?> logout(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.invalidate();
		}
		SecurityContextHolder.clearContext();

		return ResponseEntity.ok(Map.of("logout", true));
	}

	public static record LoginRequest(String username, String password) {
	}

	public static record RegisterRequest(String username, String password, String passwordRetype, String email, String mobile) {
	}
}
