package vn.devpro.shop.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import vn.devpro.shop.dto.CategoryDto;
import vn.devpro.shop.model.Category;
import vn.devpro.shop.model.User;
import vn.devpro.shop.repository.CategoryRepository;
import vn.devpro.shop.repository.UserRepository;

@Service
/**
 * Service nghiệp vụ Category:
 * - truy vấn danh sách/chi tiết
 * - lọc phân trang theo điều kiện
 * - thêm, sửa, xóa cứng hoặc chuyển inactive.
 */
public class CategoryService {
	
	/** Repository thao tác bảng category. */
	private final CategoryRepository crp;
	/** Repository thao tác bảng user (createBy/updateBy). */
	private final UserRepository urp;

	public CategoryService(CategoryRepository crp, UserRepository urp) {
		this.crp = crp;
		this.urp = urp;
	}
	
	public List<Category> findAll() {
		return crp.findAll();
	}
	
	/** Lấy category theo id, không có thì trả null. */
	public Category findById(Integer id) {
		return crp.findById(id).orElse(null);
	}
	
	/** Kiểm tra trùng tên category. */
	public Boolean existsByName(String name) {
		return crp.existsByName(name);
	}

	/** Phân trang và tìm kiếm theo name, fromDate, toDate. Chỉ hiển thị category Active (status = true). */
	public Page<Category> findPage(Pageable pageable, String name, LocalDate fromDate, LocalDate toDate) {
		// Dùng Specification để ghép điều kiện động theo input filter
		Specification<Category> spec = (root, query, cb) -> {
			Predicate p = cb.conjunction();
			// Chỉ hiển thị danh mục đang active
			p = cb.and(p, cb.equal(root.get("status"), true));
			if (name != null && !name.isBlank()) {
				// Tìm gần đúng không phân biệt hoa thường
				p = cb.and(p, cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase().trim() + "%"));
			}
			if (fromDate != null) {
				p = cb.and(p, cb.greaterThanOrEqualTo(root.get("createDate"), fromDate));
			}
			if (toDate != null) {
				p = cb.and(p, cb.lessThanOrEqualTo(root.get("createDate"), toDate));
			}
			return p;
		};
		return crp.findAll(spec, pageable);
	}

	public Category insert (CategoryDto categoryDto) {
		
		// Tạo entity mới từ dữ liệu DTO
		Category category = new Category();
		category.setId(null);
		
		category.setName(categoryDto.getName());
		category.setDescription(categoryDto.getDescription());
		category.setStatus(categoryDto.getStatus()!=null?categoryDto.getStatus():Boolean.TRUE);
		
		category.setCreateDate(categoryDto.getCreateDate());
		category.setUpdateDate(categoryDto.getUpdateDate());
		
		
		if(categoryDto.getCategoryId() !=null && categoryDto.getCategoryId() !=0) {
			category.setParentCategory(//category cha 
					crp.getReferenceById(categoryDto.getCategoryId()));
		}else {
			category.setParentCategory(null);
		}
		
		if(categoryDto.getCreateById() !=null && categoryDto.getCreateById() !=0) {
			// Gán user tạo theo khóa ngoại
			User createBy = urp.getReferenceById(categoryDto.getCreateById());
			category.setCreateBy(createBy);
		}else {
			category.setCreateBy(null);
		}
		
		return crp.save(category); // luu vào db
	}

	public Category update(Integer id, CategoryDto categoryDto) {
		
		// Lấy bản ghi hiện tại để cập nhật
		Category category = crp.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Category not found: " + id));
		
		category.setName(categoryDto.getName());
		category.setDescription(categoryDto.getDescription());
		category.setStatus(categoryDto.getStatus() != null ? categoryDto.getStatus() : Boolean.TRUE);
		
		category.setCreateDate(categoryDto.getCreateDate());
		category.setUpdateDate(categoryDto.getUpdateDate());
		
		if (categoryDto.getCategoryId() != null && categoryDto.getCategoryId() != 0) {
			category.setParentCategory(crp.getReferenceById(categoryDto.getCategoryId()));
		} else {
			category.setParentCategory(null);
		}
		
		if (categoryDto.getCreateById() != null && categoryDto.getCreateById() != 0) {
			User createBy = urp.getReferenceById(categoryDto.getCreateById());
			category.setCreateBy(createBy);
		} else {
			category.setCreateBy(null);
		}
		
		if (categoryDto.getUpdateById() != null && categoryDto.getUpdateById() != 0) {
			// Cập nhật user sửa cuối cùng
			User updateBy = urp.getReferenceById(categoryDto.getUpdateById());
			category.setUpdateBy(updateBy);
		} else {
			category.setUpdateBy(null);
		}
		
		return crp.save(category);
	}
	/**
	 * Xóa category: trước tiên gỡ quan hệ cha của các category con (set parent = null),
	 * sau đó mới xóa để tránh lỗi khóa ngoại.
	 */
	public void deleteById(Integer id) {
		List<Category> children = crp.findByParentCategory_Id(id);
		for (Category c : children) {
			c.setParentCategory(null);
		}
		crp.saveAll(children);
		crp.deleteById(id);
	}
	public void inactive(Integer id) {
		// Soft delete: chỉ khóa hiển thị thay vì xóa bản ghi
		Category category = findById(id);
		if(category==null) {
			return;
		}
		category.setStatus(false);
		crp.save(category);
	}
}
