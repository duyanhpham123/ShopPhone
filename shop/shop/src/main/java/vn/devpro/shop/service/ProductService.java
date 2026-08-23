package vn.devpro.shop.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import vn.devpro.shop.dto.ProductDto;
import vn.devpro.shop.model.Category;
import vn.devpro.shop.model.ProductImage;
import vn.devpro.shop.model.Product;
import vn.devpro.shop.model.User;
import vn.devpro.shop.repository.ProductRepository;

/**
 * Nghiệp vụ sản phẩm: truy vấn có phân trang/lọc (JPA Specification), CRUD,
 * kiểm tra trùng tên, gắn ảnh gallery qua quan hệ với {@link ProductImage}.
 */
@Service
public class ProductService {

	/** Truy cập DB qua Spring Data JPA. */
	private final ProductRepository prp;

	public ProductService(ProductRepository prp) {
		this.prp = prp;
	}

	/**
	 * Danh sách sản phẩm có phân trang + bộ lọc động.
	 * <p>
	 * Các tham số {@code null} hoặc rỗng (tùy loại) sẽ <b>bỏ qua</b> điều kiện tương ứng.
	 * </p>
	 *
	 * @param pageable   trang, kích thước trang, sort (do controller truyền vào)
	 * @param status     chuỗi {@code "true"}/{@code "false"} → lọc theo cột {@code status}
	 * @param categoryId lọc theo id danh mục ({@code > 0} mới áp dụng)
	 * @param keyword    tìm gần đúng theo {@code name} (không phân biệt hoa thường)
	 * @param fromPrice  giá &gt;= fromPrice
	 * @param toPrice    giá &lt;= toPrice
	 * @param fromDate   ngày tạo &gt;= fromDate ({@code createDate})
	 * @param toDate     ngày tạo &lt;= toDate ({@code createDate})
	 * @return {@link Page} chứa {@link Product} và metadata phân trang
	 */
	public Page<Product> findPage(Pageable pageable,
								  String status,
								  Integer categoryId,
								  String keyword,
								  BigDecimal fromPrice,
								  BigDecimal toPrice,
								  LocalDate fromDate,
								  LocalDate toDate) {

		// Specification: ghép nhiều Predicate bằng AND (cb.conjunction())
		Specification<Product> spec = (root, query, cb) -> {
			Predicate p = cb.conjunction();

			// Lọc đang bán / ngừng: status query là string, parse sang boolean
			if (status != null && !status.isBlank()) {
				boolean active = Boolean.parseBoolean(status);
				p = cb.and(p, cb.equal(root.get("status"), active));
			}

			// Lọc theo danh mục (quan hệ ManyToOne category → id)
			if (categoryId != null && categoryId > 0) {
				p = cb.and(p, cb.equal(root.get("category").get("id"), categoryId));
			}

			// Tìm kiếm theo tên: LIKE %keyword% lower-case
			if (keyword != null && !keyword.isBlank()) {
				String like = "%" + keyword.toLowerCase().trim() + "%";
				p = cb.and(p, cb.like(cb.lower(root.get("name")), like));
			}

			// Khoảng giá (theo cột price)
			if (fromPrice != null) {
				p = cb.and(p, cb.greaterThanOrEqualTo(root.get("price"), fromPrice));
			}
			if (toPrice != null) {
				p = cb.and(p, cb.lessThanOrEqualTo(root.get("price"), toPrice));
			}

			// Khoảng ngày tạo (createDate)
			if (fromDate != null) {
				p = cb.and(p, cb.greaterThanOrEqualTo(root.get("createDate"), fromDate));
			}
			if (toDate != null) {
				p = cb.and(p, cb.lessThanOrEqualTo(root.get("createDate"), toDate));
			}

			return p;
		};

		return prp.findAll(spec, pageable);
	}

	/**
	 * Lấy một sản phẩm theo khóa chính.
	 *
	 * @param id id sản phẩm; {@code null} hoặc &lt;= 0 → trả {@code null}
	 * @return entity hoặc {@code null} nếu không tồn tại
	 */
	public Product findById(Integer id) {
		if (id == null || id <= 0) {
			return null;
		}
		return prp.findById(id).orElse(null);
	}
	
	

	/**
	 * Kiểm tra đã có sản phẩm nào trùng tên (dùng khi thêm/sửa, tránh trùng).
	 *
	 * @param name tên cần kiểm tra
	 * @return {@code true} nếu repository báo tồn tại; tên null/rỗng → {@code false}
	 */
	public boolean existsByName(String name) {
		if (name == null || name.isBlank()) {
			return false;
		}
		return Boolean.TRUE.equals(prp.existsByName(name));
	}

	/**
	 * Tạo mới sản phẩm từ DTO + entity liên kết (category, user) + đường dẫn avatar + ảnh phụ.
	 * <p>
	 * Ảnh gallery được thêm qua {@link Product#addRelationalProductImage(ProductImage)}
	 * (cascade/persist tùy cấu hình entity).
	 * </p>
	 *
	 * @param dto       dữ liệu form
	 * @param category  danh mục (đã validate ở controller)
	 * @param createBy  người tạo (có thể null nếu controller fallback FK)
	 * @param updateBy  người sửa (thường null khi thêm mới)
	 * @param avatar    tên file avatar đã upload, hoặc null
	 * @param images    danh sách ảnh gallery đã upload
	 * @return {@link Product} đã lưu
	 */
	public Product insert(ProductDto dto,
						   Category category,
						   User createBy,
						   User updateBy,
						   String avatar,
						   List<ProductImage> images) {
		Product product = new Product();
		// --- Field map từ DTO + giá trị mặc định an toàn ---
		product.setName(dto.getName());
		product.setCategory(category);
		product.setAvatar(avatar);
		product.setPrice(dto.getPrice() != null ? dto.getPrice() : BigDecimal.ZERO);
		product.setSalePrice(dto.getSalePrice() != null ? dto.getSalePrice() : BigDecimal.ZERO);
		product.setIsHot(dto.getIsHot() != null ? dto.getIsHot() : Boolean.FALSE);
		product.setCreateDate(dto.getCreateDate() != null ? dto.getCreateDate() : LocalDate.now());
		product.setUpdateDate(dto.getUpdateDate());
		product.setShortDescription(dto.getShortDescription());
		product.setDetailDescription(dto.getDetailDescription());
		product.setSeo(dto.getSeo());
		product.setStatus(dto.getStatus() != null ? dto.getStatus() : Boolean.TRUE);
		product.setCreateBy(createBy);
		product.setUpdateBy(updateBy);

		// Gắn ảnh con (OneToMany / collection) trước khi save
		if (images != null) {
			for (ProductImage img : images) {
				if (img != null) {
					product.addRelationalProductImage(img);
				}
			}
		}

		return prp.save(product);
	}

	/**
	 * Cập nhật sản phẩm theo id: ghi đè field từ DTO, chỉ đổi avatar nếu có file mới,
	 * append thêm ảnh gallery mới (nếu có).
	 *
	 * @param id         id sản phẩm cần sửa
	 * @param dto        dữ liệu form
	 * @param category   danh mục mới
	 * @param createBy   người tạo (có thể null khi fallback FK)
	 * @param updateBy   người sửa
	 * @param avatar     tên file avatar mới; {@code null} = giữ avatar cũ
	 * @param newImages  ảnh gallery mới upload (append vào collection)
	 * @return {@link Product} sau khi lưu
	 * @throws IllegalArgumentException nếu không tìm thấy sản phẩm {@code id}
	 */
	public Product update(Integer id,
						   ProductDto dto,
						   Category category,
						   User createBy,
						   User updateBy,
						   String avatar,
						   List<ProductImage> newImages) {
		Product product = findById(id);
		if (product == null) {
			throw new IllegalArgumentException("Product not found: " + id);
		}

		product.setName(dto.getName());
		product.setCategory(category);
		// Chỉ cập nhật avatar khi user chọn file mới (controller truyền non-null)
		if (avatar != null) {
			product.setAvatar(avatar);
		}
		product.setPrice(dto.getPrice() != null ? dto.getPrice() : BigDecimal.ZERO);
		product.setSalePrice(dto.getSalePrice() != null ? dto.getSalePrice() : BigDecimal.ZERO);
		product.setIsHot(dto.getIsHot() != null ? dto.getIsHot() : Boolean.FALSE);
		product.setCreateDate(dto.getCreateDate() != null ? dto.getCreateDate() : product.getCreateDate());
		product.setUpdateDate(dto.getUpdateDate() != null ? dto.getUpdateDate() : LocalDate.now());
		product.setShortDescription(dto.getShortDescription());
		product.setDetailDescription(dto.getDetailDescription());
		product.setSeo(dto.getSeo());
		product.setStatus(dto.getStatus() != null ? dto.getStatus() : Boolean.TRUE);
		product.setCreateBy(createBy);
		product.setUpdateBy(updateBy);

		if (newImages != null) {
			for (ProductImage img : newImages) {
				if (img != null) {
					product.addRelationalProductImage(img);
				}
			}
		}

		return prp.save(product);
	}

	/**
	 * Xóa sản phẩm theo id (hard delete). Id không hợp lệ thì bỏ qua, không ném lỗi.
	 *
	 * @param id khóa chính
	 */
	public void deleteById(Integer id) {
		if (id == null || id <= 0) {
			return;
		}
		prp.deleteById(id);
	}

	public Product save(Product product) {
		return prp.save(product);
	}
}
