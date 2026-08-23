package vn.devpro.shop.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Redirect các URL MVC cũ (đã xóa Thymeleaf) sang giao diện tĩnh FE trong {@code app.fe.base-url}.
 */
@Controller
public class LegacyShopRedirectController {

	private final String baseUrl;

	public LegacyShopRedirectController(@Value("${app.fe.base-url:http://127.0.0.1:5500}") String baseUrl) {
		String t = baseUrl == null ? "" : baseUrl.trim();
		if (t.endsWith("/")) {
			t = t.substring(0, t.length() - 1);
		}
		this.baseUrl = t.isEmpty() ? "http://127.0.0.1:5500" : t;
	}

	private RedirectView to(String pathAndQuery) {
		if (pathAndQuery == null || pathAndQuery.isBlank()) {
			pathAndQuery = "/index.html";
		}
		if (!pathAndQuery.startsWith("/")) {
			pathAndQuery = "/" + pathAndQuery;
		}
		return new RedirectView(baseUrl + pathAndQuery, false);
	}

	private RedirectView withQuery(HttpServletRequest request, String path) {
		String q = request.getQueryString();
		if (q != null && !q.isBlank()) {
			return to(path + "?" + q);
		}
		return to(path);
	}

	@GetMapping("/login")
	public RedirectView login() {
		return to("/index.html");
	}

	@GetMapping({ "/signup", "/register" })
	public RedirectView signupGet() {
		return to("/index.html");
	}

	@GetMapping({ "/index", "/" })
	public RedirectView index(HttpServletRequest request) {
		return withQuery(request, "/index.html");
	}

	@GetMapping("/products")
	public RedirectView products(HttpServletRequest request) {
		return withQuery(request, "/products.html");
	}

	@GetMapping("/accessories")
	public RedirectView accessories(HttpServletRequest request) {
		return withQuery(request, "/accessories.html");
	}

	@GetMapping("/cart")
	public RedirectView cart() {
		return to("/cart.html");
	}

	@GetMapping("/product")
	public RedirectView product(HttpServletRequest request, @RequestParam(required = false) Integer id) {
		String q = request.getQueryString();
		if (q != null && !q.isBlank()) {
			return to("/product-detail.html?" + q);
		}
		if (id != null) {
			return to("/product-detail.html?id=" + id);
		}
		return to("/products.html");
	}

	@GetMapping("/product-detail")
	public RedirectView productDetail(HttpServletRequest request) {
		return withQuery(request, "/product-detail.html");
	}

	@GetMapping("/gioi-thieu")
	public RedirectView about() {
		return to("/about.html");
	}

	@GetMapping("/tro-giup")
	public RedirectView help() {
		return to("/help.html");
	}

	@GetMapping("/lien-he")
	public RedirectView contact() {
		return to("/contact.html");
	}

	@GetMapping("/admin/home")
	public RedirectView adminHome() {
		return to("/admin.html");
	}

	@GetMapping("/admin/order")
	public RedirectView adminOrders(HttpServletRequest request) {
		return withQuery(request, "/admin-orders.html");
	}

	@GetMapping("/admin/category")
	public RedirectView adminCategory(HttpServletRequest request) {
		return withQuery(request, "/admin.html");
	}

	@GetMapping("/staff/product")
	public RedirectView staffProducts(HttpServletRequest request) {
		return withQuery(request, "/admin-products.html");
	}
}
