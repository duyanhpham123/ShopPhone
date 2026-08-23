package vn.devpro.shop.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class Cart {
	
	// Danh sách các sản phẩm đang có trong giỏ.
	private List<CartItem> items = new ArrayList<CartItem>();

	// Thymeleaf / JSP dùng property "items" → cần getItems().
	public List<CartItem> getItems() {
		return items;
	}

	// Giữ tên cũ cho code đang gọi getItem().
	public List<CartItem> getItem() {
		return items;
	}

	// Gán mới danh sách item cho giỏ.
	public void setItems(List<CartItem> items) {
		this.items=items;
	}

	// Tìm vị trí sản phẩm trong giỏ theo productId.
	// Trả về index nếu tìm thấy, trả -1 nếu chưa có.
	public int findById(Integer productId) {
		for(int i=0;i<this.items.size();i++) {
			if(this.items.get(i).getId()==productId)
			{
				return i;
			}
		}
		return -1;
	}

	// Tính tổng tiền toàn giỏ = tổng thành tiền của từng item.
	public BigDecimal getTotalCartPrice() {
		BigDecimal total = BigDecimal.ZERO;
		for (CartItem item : this.items) {
			total = total.add(item.getTotalPrice());
		}
		return total;
	}

	// Tính tổng số lượng sản phẩm trong giỏ.
	public int getTotalProducts() {
		int total = 0;
		for (CartItem item : this.items) {
			total += item.getQuantity();
		}
		return total;
	}
}
