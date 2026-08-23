package vn.devpro.shop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.devpro.shop.model.OrderStatus;

public interface OrderStatusRepository extends JpaRepository<OrderStatus, Integer> {

	List<OrderStatus> findByStatusTrue();

	Optional<OrderStatus> findByName(String name);
}
