package vn.devpro.shop.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.devpro.shop.model.PromoCode;

public interface PromoCodeRepository extends JpaRepository<PromoCode, Integer> {

    Optional<PromoCode> findByCodeIgnoreCase(String code);

    List<PromoCode> findByStatusTrueOrderByIdDesc();
}
