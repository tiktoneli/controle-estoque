package com.brisa.controleEstoque.repository;

import com.brisa.controleEstoque.entity.Type;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface TypeRepository extends JpaRepository<Type, UUID>, JpaSpecificationExecutor<Type> {
}