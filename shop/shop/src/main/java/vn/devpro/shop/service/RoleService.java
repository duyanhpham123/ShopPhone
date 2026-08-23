package vn.devpro.shop.service;

import vn.devpro.shop.model.Role;
import org.springframework.stereotype.Service;

import vn.devpro.shop.repository.RoleRepository;

@Service
public class RoleService {
	
	private final RoleRepository rrp;
	public RoleService(RoleRepository rrp) {
		this.rrp=rrp;
	}
	public Role findByName(String name) {
		return rrp.findByName(name);
	}
}
