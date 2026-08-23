package vn.devpro.shop.service;

import java.util.List;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import vn.devpro.shop.model.User;
import vn.devpro.shop.repository.UserRepository;

@Service
public class UserService {
	
	private final UserRepository urp;

	public UserService(UserRepository urp) {
		this.urp = urp;
	}
	
	public List<User> findAll() {
		return urp.findAll();
	}
	public User findById(Integer id) {
		return urp.findById(id).orElse(null);
	}

	public User findByUsername(String username) {
		return urp.findByUsername(username);
	}
	
	public User findByUsernameAndStatus(String username, Boolean status) {
		return urp.findByUsernameAndStatus(username, status).
		        orElseThrow(() -> 
		            new UsernameNotFoundException(
		                "Username not found with username: " + username));
	}

	public User create(User user) {
		return urp.save(user);
	}
}
