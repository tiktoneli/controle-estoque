package com.brisa.controleEstoque.repository.specification;

import com.brisa.controleEstoque.entity.Type;
import org.springframework.data.jpa.domain.Specification;

public class TypeSpecification extends BaseSpecification<Type> {
    
    public Specification<Type> search(String searchTerm) {
        return createSpecification(searchTerm, "name");
    }
} 