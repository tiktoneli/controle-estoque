package com.brisa.controleEstoque.repository.specification;

import com.brisa.controleEstoque.entity.Product;
import org.springframework.data.jpa.domain.Specification;
import java.util.UUID;

public class ProductSpecification extends BaseSpecification<Product> {
    
    public Specification<Product> search(String searchTerm) {
        return createSpecification(searchTerm, "name");
    }
    
    public Specification<Product> byType(UUID typeId) {
        return (root, query, cb) -> {
            if (typeId == null) {
                return null;
            }
            return cb.equal(root.get("type").get("id"), typeId);
        };
    }
} 