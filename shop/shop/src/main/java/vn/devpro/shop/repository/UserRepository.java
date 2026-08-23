package vn.devpro.shop.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.devpro.shop.model.User;

public interface UserRepository extends JpaRepository<User, Integer> {
	
	Optional<User> findById(Integer id);
	
	public User findByUsername(String username);
	
	Optional<User> findByUsernameAndStatus(String username, 
							Boolean status);

}
