package vn.devpro.shop.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO nhận dữ liệu form đăng ký ({@code signup.html}, POST {@code /register}).
 */
public class UserDto {

	@NotBlank(message = "Username is required")
	@Size(min = 3, max = 120, message = "Username must be 3–120 characters")
	private String username;

	@NotBlank(message = "Password is required")
	@Size(min = 6, max = 120, message = "Password must be 6–120 characters")
	private String password;

	@NotBlank(message = "Please retype password")
	private String passwordRetype;

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email")
	private String email;

	private String mobile;

	public UserDto() {
		super();
	}

	public UserDto(String username, String password, String passwordRetype, String email, String mobile) {
		super();
		this.username = username;
		this.password = password;
		this.passwordRetype = passwordRetype;
		this.email = email;
		this.mobile = mobile;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getPasswordRetype() {
		return passwordRetype;
	}

	public void setPasswordRetype(String passwordRetype) {
		this.passwordRetype = passwordRetype;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getMobile() {
		return mobile;
	}

	public void setMobile(String mobile) {
		this.mobile = mobile;
	}
}
