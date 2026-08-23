package vn.devpro.shop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.devpro.shop.model.ProductImage;

public interface ProductImageRepository extends JpaRepository<ProductImage, Integer> {

	List<ProductImage> findAllByProduct_Id(Integer productId);
}
