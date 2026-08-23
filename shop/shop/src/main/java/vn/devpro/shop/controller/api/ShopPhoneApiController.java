package vn.devpro.shop.controller.api;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import vn.devpro.shop.model.OrderStatus;
import vn.devpro.shop.model.PromoCode;
import vn.devpro.shop.model.Product;
import vn.devpro.shop.model.ProductImage;
import vn.devpro.shop.model.SaleOrder;
import vn.devpro.shop.model.SaleOrderProduct;
import vn.devpro.shop.model.User;
import vn.devpro.shop.repository.PromoCodeRepository;
import vn.devpro.shop.repository.SaleOrderRepository;
import vn.devpro.shop.service.OrderStatusService;
import vn.devpro.shop.service.ProductImageService;
import vn.devpro.shop.service.ProductService;
import vn.devpro.shop.service.UserService;

@RestController
@RequestMapping("/api/shopphone")
public class ShopPhoneApiController {

	private final ProductService productService;
	private final ProductImageService productImageService;
	private final SaleOrderRepository saleOrderRepository;
	private final PromoCodeRepository promoCodeRepository;
	private final OrderStatusService orderStatusService;
	private final UserService userService;

	public ShopPhoneApiController(
			ProductService productService,
			ProductImageService productImageService,
			SaleOrderRepository saleOrderRepository,
			PromoCodeRepository promoCodeRepository,
			OrderStatusService orderStatusService,
			UserService userService) {
		this.productService = productService;
		this.productImageService = productImageService;
		this.saleOrderRepository = saleOrderRepository;
		this.promoCodeRepository = promoCodeRepository;
		this.orderStatusService = orderStatusService;
		this.userService = userService;
	}

	@GetMapping("/products")
	public ResponseEntity<?> products(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "24") int size,
			@RequestParam(defaultValue = "createDate") String sortBy,
			@RequestParam(defaultValue = "desc") String direction,
			@RequestParam(required = false) String keyword) {
		Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
		Pageable pageable = PageRequest.of(page, size, sort);
		Page<Product> productPage = productService.findPage(pageable, "true", null, keyword, null, null, null, null);

		List<Map<String, Object>> items = new ArrayList<>();
		for (Product p : productPage.getContent()) {
			items.add(toProductMap(p));
		}

		Map<String, Object> data = new LinkedHashMap<>();
		data.put("items", items);
		data.put("page", productPage.getNumber());
		data.put("size", productPage.getSize());
		data.put("totalPages", productPage.getTotalPages());
		data.put("totalItems", productPage.getTotalElements());
		return ResponseEntity.ok(data);
	}

	@GetMapping("/products/{id}")
	public ResponseEntity<?> productDetail(@PathVariable Integer id) {
		Product product = productService.findById(id);
		if (product == null || !Boolean.TRUE.equals(product.getStatus())) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Product not found"));
		}
		return ResponseEntity.ok(toProductMap(product));
	}

	@GetMapping("/products/{id}/images")
	public ResponseEntity<?> productImages(@PathVariable Integer id) {
		Product product = productService.findById(id);
		if (product == null || !Boolean.TRUE.equals(product.getStatus())) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Product not found"));
		}
		List<Map<String, Object>> gallery = new ArrayList<>();
		for (ProductImage img : productImageService.findAllByProduct(id)) {
			Map<String, Object> row = new LinkedHashMap<>();
			row.put("id", img.getId());
			row.put("title", img.getTitle());
			row.put("path", img.getPath());
			row.put("url", buildAvatarUrl(img.getPath()));
			gallery.add(row);
		}
		return ResponseEntity.ok(Map.of("items", gallery));
	}

	@PostMapping("/products/{id}/delete")
	@Transactional
	public ResponseEntity<?> deleteProduct(@PathVariable Integer id) {
		Product product = productService.findById(id);
		if (product == null || !Boolean.TRUE.equals(product.getStatus())) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Product not found"));
		}

		product.setStatus(Boolean.FALSE);
		productService.save(product);
		return ResponseEntity.ok(Map.of("success", true));
	}

	@PostMapping("/orders")
	@Transactional
	public ResponseEntity<?> placeOrder(@RequestBody OrderRequest request) {
		if (request == null || request.items() == null || request.items().isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Order items are required"));
		}
		if (request.customerName() == null || request.customerName().isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Customer name is required"));
		}
		if (request.customerPhone() == null || request.customerPhone().isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Customer phone is required"));
		}

		SaleOrder order = new SaleOrder();
		LocalDateTime now = LocalDateTime.now();
		String code = "SP_" + System.currentTimeMillis();
		order.setCode(code);
		order.setCreateDate(now);
		order.setUpdateDate(now);
		order.setCustomerName(request.customerName().trim());
		order.setCustomerMobile(request.customerPhone().trim());
		order.setCustomerEmail(request.customerEmail() != null ? request.customerEmail().trim() : "");
		order.setCustomerAddress(request.customerAddress() != null ? request.customerAddress().trim() : "");
		order.setStatus(Boolean.TRUE);

		OrderStatus status = orderStatusService.resolveStatusForNewOrder().orElse(null);
		if (status == null) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("success", false, "message", "Order status is not configured"));
		}
		order.setOrderStatus(status);

		User user = userService.findByUsername("customer");
		order.setUser(user);

		BigDecimal total = BigDecimal.ZERO;
		for (OrderItemRequest item : request.items()) {
			if (item == null || item.productId() == null || item.quantity() == null || item.quantity() <= 0) {
				continue;
			}
			Product product = productService.findById(item.productId());
			if (product == null || !Boolean.TRUE.equals(product.getStatus())) {
				continue;
			}
			BigDecimal chosenPrice = product.getSalePrice() != null && product.getSalePrice().compareTo(BigDecimal.ZERO) > 0
					? product.getSalePrice()
					: product.getPrice();
			if (chosenPrice == null) {
				chosenPrice = BigDecimal.ZERO;
			}

			SaleOrderProduct line = new SaleOrderProduct();
			line.setProduct(product);
			line.setName(product.getName());
			line.setQuantity(item.quantity());
			line.setPrice(chosenPrice);
			line.setCreateDate(now);
			line.setUpdateDate(now);
			line.setStatus(Boolean.TRUE);
			order.addSaleOrderProduct(line);

			total = total.add(chosenPrice.multiply(BigDecimal.valueOf(item.quantity())));
		}

		if (order.getSaleOrderProducts().isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No valid order items"));
		}

		order.setTotal(total);
		saleOrderRepository.save(order);

		return ResponseEntity.ok(Map.of(
				"success", true,
				"orderCode", code,
				"orderId", order.getId(),
				"total", total,
				"message", "Order placed successfully"));
	}

	@GetMapping("/promo-codes")
	public ResponseEntity<?> getPromoCodes() {
		List<Map<String, Object>> items = promoCodeRepository.findByStatusTrueOrderByIdDesc()
				.stream()
				.map(this::toPromoCodeMap)
				.toList();
		return ResponseEntity.ok(Map.of("items", items));
	}

	@PostMapping("/promo-codes")
	@Transactional
	public ResponseEntity<?> createOrUpdatePromoCode(@RequestBody PromoCodeRequest request) {
		String code = request.code() == null ? "" : request.code().trim().toUpperCase();
		Double discountRate = request.discountRate();
		LocalDateTime expiresAt = request.expiresAt();

		if (code.isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Promo code is required"));
		}
		if (discountRate == null || discountRate < 0.01 || discountRate > 0.10) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Discount rate must be 1%-10%"));
		}
		if (expiresAt == null || !expiresAt.isAfter(LocalDateTime.now())) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Expiry must be in the future"));
		}

		PromoCode promoCode = promoCodeRepository.findByCodeIgnoreCase(code).orElseGet(PromoCode::new);
		promoCode.setCode(code);
		promoCode.setDiscountRate(discountRate);
		promoCode.setExpiresAt(expiresAt);
		promoCode.setStatus(Boolean.TRUE);
		PromoCode saved = promoCodeRepository.save(promoCode);

		return ResponseEntity.ok(Map.of(
				"success", true,
				"item", toPromoCodeMap(saved)));
	}

	@PostMapping("/promo-codes/{code}/delete")
	@Transactional
	public ResponseEntity<?> deletePromoCode(@PathVariable String code) {
		if (code == null || code.trim().isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Promo code is required"));
		}

		Optional<PromoCode> promoCodeOpt = promoCodeRepository.findByCodeIgnoreCase(code.trim());
		if (promoCodeOpt.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Promo code not found"));
		}

		PromoCode promoCode = promoCodeOpt.get();
		promoCode.setStatus(Boolean.FALSE);
		promoCodeRepository.save(promoCode);
		return ResponseEntity.ok(Map.of("success", true));
	}

	private Map<String, Object> toProductMap(Product p) {
		Map<String, Object> map = new LinkedHashMap<>();
		map.put("id", p.getId());
		map.put("name", p.getName());
		map.put("price", p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO);
		map.put("salePrice", p.getSalePrice() != null ? p.getSalePrice() : BigDecimal.ZERO);
		map.put("categoryName", p.getCategory() != null ? p.getCategory().getName() : null);
		map.put("shortDescription", p.getShortDescription());
		map.put("detailDescription", p.getDetailDescription());
		map.put("avatar", p.getAvatar());
		map.put("avatarUrl", buildAvatarUrl(p.getAvatar()));
		return map;
	}

	private String buildAvatarUrl(String avatar) {
		if (avatar == null || avatar.isBlank()) {
			return null;
		}
		return ServletUriComponentsBuilder.fromCurrentContextPath()
				.path("/UploadFiles/")
				.path(avatar)
				.toUriString();
	}

	private Map<String, Object> toPromoCodeMap(PromoCode promoCode) {
		Map<String, Object> map = new LinkedHashMap<>();
		map.put("id", promoCode.getId());
		map.put("code", promoCode.getCode());
		map.put("discountRate", promoCode.getDiscountRate());
		map.put("expiresAt", promoCode.getExpiresAt());
		return map;
	}

	public static record OrderItemRequest(Integer productId, Integer quantity) {
	}

	public static record OrderRequest(
			String customerName,
			String customerPhone,
			String customerEmail,
			String customerAddress,
			List<OrderItemRequest> items) {
	}

	public static record PromoCodeRequest(
			String code,
			Double discountRate,
			LocalDateTime expiresAt) {
	}
}
