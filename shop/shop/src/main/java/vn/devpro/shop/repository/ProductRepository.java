package vn.devpro.shop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import vn.devpro.shop.model.Product;

/**
 * Repository cho Product:
 * - CRUD cơ bản
 * - hỗ trợ Specification để lọc/tìm kiếm động.
 */
public interface ProductRepository 
		extends JpaRepository<Product, Integer>,
					JpaSpecificationExecutor<Product>{

	/** Kiểm tra trùng tên sản phẩm. */
	Boolean existsByName(String name);
	
	Optional<Product> findById(Integer id);
	
	/** Danh sách sản phẩm đang active. */
	public List<Product> findByStatusTrue();
}