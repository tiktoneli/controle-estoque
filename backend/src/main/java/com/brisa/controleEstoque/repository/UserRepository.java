package com.brisa.controleEstoque.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.brisa.controleEstoque.entity.User;
import com.brisa.controleEstoque.entity.enums.Role;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByIsActiveTrue();

    @Query("SELECT u FROM User u WHERE u.role != 'SUPERUSER' ORDER BY u.createdAt DESC")
    List<User> findAllNonSuperUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'SUPERUSER'")
    long countSuperUsers();
}