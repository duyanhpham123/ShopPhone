package vn.devpro.shop.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import vn.devpro.shop.model.OrderStatus;
import vn.devpro.shop.model.SaleOrder;
import vn.devpro.shop.repository.SaleOrderRepository;

@Service
public class SaleOrderService {
	private final SaleOrderRepository srp;

	public SaleOrderService(SaleOrderRepository sRepo) {
		this.srp = sRepo;
	}

	public List<SaleOrder> finAll() {
		return srp.findAll();
	}

	public SaleOrder findById(Integer id) {
		return srp.findById(id).orElse(null);
	}

	public SaleOrder insert(SaleOrder saleorder) {
		return srp.save(saleorder);
	}

	public Page<SaleOrder> findAll(int page, int size, String column, String direction) {
		Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(column).descending() : Sort.by(column).ascending();
		Pageable pageable = PageRequest.of(page, size, sort);
		return srp.findAll(pageable);
	}

	/**
	 * Tìm đơn hàng có phân trang: keyword (null/blank = bỏ qua), status (null = tất cả),
	 * orderStatusId ({@code null} hoặc {@code <= 0} = tất cả), lọc theo {@link SaleOrder#createDate} khi có fromDate/toDate.
	 */
	public Page<SaleOrder> search(String keyword, Boolean status, Integer orderStatusId, LocalDateTime fromDate,
			LocalDateTime toDate, Pageable pageable) {
		Specification<SaleOrder> spec = (root, q, cb) -> cb.conjunction();

		if (StringUtils.hasText(keyword)) {
			String kw = "%" + keyword.trim().toLowerCase() + "%";
			spec = spec.and((root, q, cb) -> {
				List<Predicate> ors = new ArrayList<>();
				ors.add(cb.like(cb.lower(root.get("customerName")), kw));
				ors.add(cb.like(cb.lower(root.get("description")), kw));
				ors.add(cb.like(cb.lower(root.get("customerMobile")), kw));
				ors.add(cb.like(cb.lower(root.get("customerEmail")), kw));
				ors.add(cb.like(cb.lower(root.get("customerAddress")), kw));
				Join<SaleOrder, OrderStatus> os = root.join("orderStatus", JoinType.LEFT);
				ors.add(cb.like(cb.lower(os.get("name")), kw));
				return cb.or(ors.toArray(new Predicate[0]));
			});
		}

		if (status != null) {
			spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), status));
		}

		if (orderStatusId != null && orderStatusId > 0) {
			spec = spec.and((root, q, cb) -> cb.equal(root.get("orderStatus").get("id"), orderStatusId));
		}

		if (fromDate != null) {
			spec = spec.and((root, q, cb) -> cb.greaterThanOrEqualTo(root.get("createDate"), fromDate));
		}
		if (toDate != null) {
			spec = spec.and((root, q, cb) -> cb.lessThanOrEqualTo(root.get("createDate"), toDate));
		}

		return srp.findAll(spec, pageable);
	}
}
