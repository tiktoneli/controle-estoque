package com.brisa.controleEstoque.repository.specification;

import com.brisa.controleEstoque.entity.Location;
import org.springframework.data.jpa.domain.Specification;

public class LocationSpecification extends BaseSpecification<Location> {
    
    public Specification<Location> search(String searchTerm) {
        return createSpecification(searchTerm, "name");
    }
} 