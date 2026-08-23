package vn.devpro.shop.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Dòng sản phẩm trong đơn hàng, ánh xạ bảng {@code tbl_sale_order_product}.
 */
@Entity
@Table(name = "tbl_sale_order_product")
public class SaleOrderProduct {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "sale_order_id", referencedColumnName = "id", nullable = false)
	private SaleOrder saleOrder;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "product_id", referencedColumnName = "id", nullable = false)
	private Product product;

	@Column(name = "quantity", nullable = false)
	private Integer quantity = 1;

	@Column(name = "price", precision = 38, scale = 2, nullable = false)
	private BigDecimal price = BigDecimal.ZERO;

	@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	@Column(name = "create_date")
	private LocalDateTime createDate;

	@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	@Column(name = "update_date")
	private LocalDateTime updateDate;

	@Column(name = "status")
	private Boolean status = Boolean.TRUE;

	@Column(name = "description", length = 500)
	private String description;

	/** Tên sản phẩm snapshot tại thời điểm đặt (cột {@code name}). */
	@Column(name = "name", length = 300)
	private String name;
	
	
	public SaleOrderProduct() {
		super();
	}
	
	public SaleOrderProduct(Integer id, SaleOrder saleOrder, Product product, Integer quantity, BigDecimal price,
			LocalDateTime createDate, LocalDateTime updateDate, Boolean status, String description, String name) {
		super();
		this.id = id;
		this.saleOrder = saleOrder;
		this.product = product;
		this.quantity = quantity;
		this.price = price;
		this.createDate = createDate;
		this.updateDate = updateDate;
		this.status = status;
		this.description = description;
		this.name = name;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public SaleOrder getSaleOrder() {
		return saleOrder;
	}

	public void setSaleOrder(SaleOrder saleOrder) {
		this.saleOrder = saleOrder;
	}

	public Product getProduct() {
		return product;
	}

	public void setProduct(Product product) {
		this.product = product;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
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

	public Boolean getStatus() {
		return status;
	}

	public void setStatus(Boolean status) {
		this.status = status;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	/** Thành tiền dòng = quantity × price (không lưu DB). */
	public BigDecimal getLineAmount() {
		if (quantity == null || price == null) {
			return BigDecimal.ZERO;
		}
		return price.multiply(BigDecimal.valueOf(quantity));
	}
}
