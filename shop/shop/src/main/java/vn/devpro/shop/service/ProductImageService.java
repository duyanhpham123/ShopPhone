package vn.devpro.shop.service;

import java.util.List;

import org.springframework.stereotype.Service;

import vn.devpro.shop.model.ProductImage;
import vn.devpro.shop.repository.ProductImageRepository;

@Service
public class ProductImageService {

	private final ProductImageRepository pir;

	public ProductImageService(ProductImageRepository pir) {
		this.pir = pir;
	}

	public List<ProductImage> findAllByProduct(Integer productId) {
		return pir.findAllByProduct_Id(productId);
	}
}
