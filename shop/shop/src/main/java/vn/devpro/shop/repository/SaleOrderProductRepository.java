package vn.devpro.shop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.devpro.shop.model.SaleOrderProduct;

public interface SaleOrderProductRepository extends JpaRepository<SaleOrderProduct, Integer> {

	List<SaleOrderProduct> findAllBySaleOrder_Id(Integer saleOrderId);
}
