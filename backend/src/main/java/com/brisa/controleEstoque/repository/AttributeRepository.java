package com.brisa.controleEstoque.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.brisa.controleEstoque.entity.Attribute;
import com.brisa.controleEstoque.entity.enums.AttributeDataType;

@Repository
public interface AttributeRepository extends JpaRepository<Attribute, UUID> {
    Optional<Attribute> findByName(String name);
    Optional<Attribute> findByNameAndDataType(String name, AttributeDataType dataType);
    Optional<Attribute> findByNameAndDataTypeAndOptions(String name, AttributeDataType dataType, String options);
} 