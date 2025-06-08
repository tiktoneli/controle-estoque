package com.brisa.controleEstoque.repository.specification;

import com.brisa.controleEstoque.entity.Lot;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDateTime;
import java.util.UUID;

public class LotSpecification {
    
    public static Specification<Lot> searchByLotNumber(String search) {
        return (root, query, cb) -> {
            if (search == null || search.trim().isEmpty()) {
                return null;
            }
            return cb.like(cb.lower(root.get("lotNumber")), "%" + search.toLowerCase() + "%");
        };
    }

    public static Specification<Lot> searchByProductId(UUID productId) {
        return (root, query, cb) -> {
            if (productId == null) {
                return null;
            }
            return cb.equal(root.get("product").get("id"), productId);
        };
    }

    public static Specification<Lot> searchByManufacturingDate(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (startDate == null && endDate == null) {
                return null;
            }
            if (startDate != null && endDate != null) {
                return cb.between(root.get("manufacturingDate"), startDate, endDate);
            }
            if (startDate != null) {
                return cb.greaterThanOrEqualTo(root.get("manufacturingDate"), startDate);
            }
            return cb.lessThanOrEqualTo(root.get("manufacturingDate"), endDate);
        };
    }

    public static Specification<Lot> searchByExpirationDate(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (startDate == null && endDate == null) {
                return null;
            }
            if (startDate != null && endDate != null) {
                return cb.between(root.get("expirationDate"), startDate, endDate);
            }
            if (startDate != null) {
                return cb.greaterThanOrEqualTo(root.get("expirationDate"), startDate);
            }
            return cb.lessThanOrEqualTo(root.get("expirationDate"), endDate);
        };
    }
} 