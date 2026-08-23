package vn.devpro.shop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import vn.devpro.shop.model.SaleOrder;

public interface SaleOrderRepository extends JpaRepository<SaleOrder, Integer>, JpaSpecificationExecutor<SaleOrder> {

	Optional<SaleOrder> findByCode(String code);
	public List<SaleOrder> findAll();
}
