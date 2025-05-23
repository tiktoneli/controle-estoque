package com.brisa.controleEstoque.repository.specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public abstract class BaseSpecification<T> {
    
    protected Specification<T> createSpecification(String searchTerm, String... fields) {
        return (Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return null;
            }

            String searchPattern = "%" + searchTerm.toLowerCase() + "%";
            List<Predicate> predicates = new ArrayList<>();

            for (String field : fields) {
                predicates.add(cb.like(cb.lower(root.get(field)), searchPattern));
            }

            return cb.or(predicates.toArray(new Predicate[0]));
        };
    }
} 