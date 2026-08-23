package vn.devpro.shop.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
	
	@Autowired
	private UserService us;
	
	@Override
	public UserDetails loadUserByUsername(String username)throws UsernameNotFoundException
	{
		return us.findByUsernameAndStatus(username,true);
	}
}
