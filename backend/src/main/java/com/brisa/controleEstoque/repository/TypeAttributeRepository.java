package com.brisa.controleEstoque.repository;

import com.brisa.controleEstoque.entity.TypeAttribute;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TypeAttributeRepository extends JpaRepository<TypeAttribute, TypeAttribute.TypeAttributeId> {
    boolean existsByIdAttributeId(java.util.UUID attributeId);
} 