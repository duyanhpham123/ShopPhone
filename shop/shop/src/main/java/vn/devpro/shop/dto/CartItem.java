package vn.devpro.shop.dto;

import java.math.BigDecimal;

public class CartItem {
	
	// id của sản phẩm.
	private Integer id;
	// tên hiển thị của sản phẩm.
	private String name;
	// số lượng sản phẩm trong giỏ.
	private int quantity;
	// đơn giá tại thời điểm thêm vào giỏ.
	private BigDecimal price;
	// ảnh đại diện của sản phẩm.
	private String avatar;
	
	// Tính thành tiền của dòng sản phẩm = số lượng * giá.
	public BigDecimal getTotalPrice() {
		return this.price.multiply(new BigDecimal(this.quantity));
		
	}

	// Cộng thêm số lượng (dùng khi sản phẩm đã có sẵn trong giỏ).
	public void updateQuantity(int quantity) {
		this.quantity = this.quantity + quantity;
	}

	// Lấy số lượng hiện tại.
	public int getQuantity() {
		return quantity;
	}

	// Set lại số lượng mới.
	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}

	// Lấy tên sản phẩm.
	public String getName() {
		return name;
	}

	// Set tên sản phẩm.
	public void setName(String name) {
		this.name = name;
	}

	// Lấy giá sản phẩm.
	public BigDecimal getPrice() {
		return price;
	}

	// Set giá sản phẩm.
	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	// Lấy ảnh đại diện sản phẩm.
	public String getAvatar() {
		return avatar;
	}

	// Set ảnh đại diện sản phẩm.
	public void setAvatar(String avatar) {
		this.avatar = avatar;
	}

	// Constructor rỗng cho JavaBean/Jackson.
	public CartItem() {
		super();
	}

	// Lấy id sản phẩm.
	public Integer getId() {
		return id;
	}

	// Set id sản phẩm.
	public void setId(Integer id) {
		this.id = id;
	}
}
