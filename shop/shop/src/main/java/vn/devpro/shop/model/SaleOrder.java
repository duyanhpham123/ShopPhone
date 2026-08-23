package vn.devpro.shop.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * Đơn hàng (header), ánh xạ bảng {@code tbl_sale_order}.
 */
@Entity
@Table(name = "tbl_sale_order")
public class SaleOrder {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Integer id;

	@Column(name = "code", nullable = false, length = 60)
	private String code;

	@Column(name = "total", precision = 38, scale = 2, nullable = false)
	private BigDecimal total = BigDecimal.ZERO;

	@Column(name = "customer_name", nullable = false, length = 300)
	private String customerName;

	@Column(name = "customer_mobile", length = 120)
	private String customerMobile;

	@Column(name = "customer_email", length = 120)
	private String customerEmail;

	@Column(name = "customer_address", length = 300)
	private String customerAddress;

	@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	@Column(name = "create_date")
	private LocalDateTime createDate;

	@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	@Column(name = "update_date")
	private LocalDateTime updateDate;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "order_status", referencedColumnName = "id")
	private OrderStatus orderStatus;

	/** Khách đăng nhập đặt hàng; có thể null nếu đơn khách vãng lai. */
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "user_id", referencedColumnName = "id", nullable = true)
	private User user;

	@Column(name = "status")
	private Boolean status = Boolean.TRUE;

	@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	@Column(name = "delivery_date", nullable = true)
	private LocalDateTime deliveryDate;

	@Column(name = "description", length = 500)
	private String description;

	@OneToMany(mappedBy = "saleOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	private List<SaleOrderProduct> saleOrderProducts = new ArrayList<>();

	public SaleOrder() {
		super();
	}

	public SaleOrder(Integer id, String code, BigDecimal total, String customerName, String customerMobile,
			String customerEmail, String customerAddress, LocalDateTime createDate, LocalDateTime updateDate,
			OrderStatus orderStatus, User user, Boolean status, LocalDateTime deliveryDate, String description,
			List<SaleOrderProduct> saleOrderProducts) {
		super();
		this.id = id;
		this.code = code;
		this.total = total;
		this.customerName = customerName;
		this.customerMobile = customerMobile;
		this.customerEmail = customerEmail;
		this.customerAddress = customerAddress;
		this.createDate = createDate;
		this.updateDate = updateDate;
		this.orderStatus = orderStatus;
		this.user = user;
		this.status = status;
		this.deliveryDate = deliveryDate;
		this.description = description;
		this.saleOrderProducts = saleOrderProducts;
	}

	public void addSaleOrderProduct(SaleOrderProduct line) {
		saleOrderProducts.add(line);
		line.setSaleOrder(this);
	}

	public void removeSaleOrderProduct(SaleOrderProduct line) {
		saleOrderProducts.remove(line);
		line.setSaleOrder(null);
	}

	/** Tên theo slide/giáo trình: gọi chung logic với {@link #addSaleOrderProduct(SaleOrderProduct)}. */
	public void addRelationalSaleOrderProduct(SaleOrderProduct saleOrderProduct) {
		addSaleOrderProduct(saleOrderProduct);
	}

	/** Tên theo slide/giáo trình: gỡ dòng khỏi đơn và hủy liên kết (phải {@code setSaleOrder(null)}, không set {@code this}). */
	public void removeRelationalSaleOrderProduct(SaleOrderProduct saleOrderProduct) {
		removeSaleOrderProduct(saleOrderProduct);
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public BigDecimal getTotal() {
		return total;
	}

	public void setTotal(BigDecimal total) {
		this.total = total;
	}

	public String getCustomerName() {
		return customerName;
	}

	public void setCustomerName(String customerName) {
		this.customerName = customerName;
	}

	public String getCustomerMobile() {
		return customerMobile;
	}

	public void setCustomerMobile(String customerMobile) {
		this.customerMobile = customerMobile;
	}

	public String getCustomerEmail() {
		return customerEmail;
	}

	public void setCustomerEmail(String customerEmail) {
		this.customerEmail = customerEmail;
	}

	public String getCustomerAddress() {
		return customerAddress;
	}

	public void setCustomerAddress(String customerAddress) {
		this.customerAddress = customerAddress;
	}

	public LocalDateTime getCreateDate() {
		return createDate;
	}

	public void setCreateDate(LocalDateTime createDate) {
		this.createDate = createDate;
	}

	public LocalDateTime getUpdateDate() {
		return updateDate;
	}

	public void setUpdateDate(LocalDateTime updateDate) {
		this.updateDate = updateDate;
	}

	public OrderStatus getOrderStatus() {
		return orderStatus;
	}

	public void setOrderStatus(OrderStatus orderStatus) {
		this.orderStatus = orderStatus;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Boolean getStatus() {
		return status;
	}

	public void setStatus(Boolean status) {
		this.status = status;
	}

	public LocalDateTime getDeliveryDate() {
		return deliveryDate;
	}

	public void setDeliveryDate(LocalDateTime deliveryDate) {
		this.deliveryDate = deliveryDate;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public List<SaleOrderProduct> getSaleOrderProducts() {
		return saleOrderProducts;
	}

	public void setSaleOrderProducts(List<SaleOrderProduct> saleOrderProducts) {
		this.saleOrderProducts = saleOrderProducts;
	}
}
