package vn.devpro.shop.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import vn.devpro.shop.model.OrderStatus;
import vn.devpro.shop.repository.OrderStatusRepository;

/**
 * Nghiệp vụ trạng thái đơn hàng ({@link OrderStatus} / {@code tbl_order_status}).
 */
@Service
public class OrderStatusService {

	/** Tên trạng thái mặc định khi tạo đơn mới (khớp dữ liệu seed / slide). */
	public static final String DEFAULT_NEW_ORDER_STATUS_NAME = "Đơn hàng mới/Chờ xử lý";

	private final OrderStatusRepository orderStatusRepository;

	public OrderStatusService(OrderStatusRepository orderStatusRepository) {
		this.orderStatusRepository = orderStatusRepository;
	}

	public Optional<OrderStatus> findById(Integer id) {
		return orderStatusRepository.findById(id);
	}

	public List<OrderStatus> findAll() {
		return orderStatusRepository.findAll();
	}

	public List<OrderStatus> findAllActive() {
		return orderStatusRepository.findByStatusTrue();
	}

	public Optional<OrderStatus> findByName(String name) {
		if (name == null || name.isBlank()) {
			return Optional.empty();
		}
		return orderStatusRepository.findByName(name.trim());
	}

	/**
	 * Trạng thái dùng khi checkout: đúng tên mặc định → bản ghi {@code status=true} đầu tiên → bất kỳ bản ghi nào
	 * → nếu bảng trống thì tạo một bản ghi mặc định (tránh lỗi khi chưa seed {@code tbl_order_status}).
	 */
	public Optional<OrderStatus> resolveStatusForNewOrder() {
		Optional<OrderStatus> byName = findByName(DEFAULT_NEW_ORDER_STATUS_NAME);
		if (byName.isPresent()) {
			return byName;
		}
		List<OrderStatus> active = findAllActive();
		if (!active.isEmpty()) {
			return Optional.of(active.get(0));
		}
		List<OrderStatus> any = findAll();
		if (!any.isEmpty()) {
			return Optional.of(any.get(0));
		}
		LocalDateTime now = LocalDateTime.now();
		OrderStatus created = new OrderStatus();
		created.setName(DEFAULT_NEW_ORDER_STATUS_NAME);
		created.setStatus(Boolean.TRUE);
		created.setCreateDate(now);
		created.setUpdateDate(now);
		created.setDescription("Tự tạo khi chưa có dữ liệu trong tbl_order_status");
		return Optional.of(orderStatusRepository.save(created));
	}

	public OrderStatus save(OrderStatus entity) {
		return orderStatusRepository.save(entity);
	}

	public void deleteById(Integer id) {
		orderStatusRepository.deleteById(id);
	}
}
