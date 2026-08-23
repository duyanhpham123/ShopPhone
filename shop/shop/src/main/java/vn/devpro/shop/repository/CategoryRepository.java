package vn.devpro.shop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import vn.devpro.shop.model.Category;

/**
 * Repository cho Category:
 * - CRUD cơ bản (JpaRepository)
 * - truy vấn động Specification (JpaSpecificationExecutor).
 */
public interface CategoryRepository 
		extends JpaRepository<Category, Integer>,
					JpaSpecificationExecutor<Category>{

	/** Kiểm tra tồn tại category theo tên (phục vụ validate trùng). */
	public Boolean existsByName(String name);
	
	Optional<Category> findById(Integer id);
	
	/** Lấy danh sách category đang active. */
	public List<Category> findByStatusTrue();

	/** Danh mục con có parent = category id này */
	List<Category> findByParentCategory_Id(Integer id);
}
