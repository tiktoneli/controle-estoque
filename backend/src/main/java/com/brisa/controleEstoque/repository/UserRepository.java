package com.brisa.controleEstoque.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.brisa.controleEstoque.entity.User;

public interface UserRepository extends JpaRepository<User, UUID> {
}
