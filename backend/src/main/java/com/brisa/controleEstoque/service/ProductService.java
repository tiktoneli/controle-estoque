package com.brisa.controleEstoque.service;

import com.brisa.controleEstoque.dto.requests.RequestProductDTO;
import com.brisa.controleEstoque.entity.Product;
import com.brisa.controleEstoque.entity.Type;
import com.brisa.controleEstoque.exceptions.ResourceBadRequestException;
import com.brisa.controleEstoque.exceptions.ResourceNotFoundException;
import com.brisa.controleEstoque.mapper.ProductMapper;
import com.brisa.controleEstoque.repository.ProductRepository;
import com.brisa.controleEstoque.repository.TypeRepository;
import com.brisa.controleEstoque.repository.specification.ProductSpecification;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ProductService {
    private final ProductRepository repository;
    private final TypeRepository typeRepository;
    private final ProductMapper productMapper;
    private final ProductSpecification productSpecification;

    public ProductService(ProductRepository repository, TypeRepository typeRepository, ProductMapper productMapper) {
        this.repository = repository;
        this.typeRepository = typeRepository;
        this.productMapper = productMapper;
        this.productSpecification = new ProductSpecification();
    }

    public Page<Product> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Product findById(UUID id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public Product create(RequestProductDTO dto) {
        Product product = productMapper.toEntity(dto);
        
        Type type = typeRepository.findById(dto.getTypeId())
            .orElseThrow(() -> new ResourceNotFoundException("Type not found with id: " + dto.getTypeId()));
        
        product.setType(type);
        
        return repository.save(product);
    }

    public Product update(UUID id, RequestProductDTO dto) {
        Product existing = findById(id);
        Type type = typeRepository.findById(dto.getTypeId())
            .orElseThrow(() -> new ResourceNotFoundException("Type not found with id: " + dto.getTypeId()));
        existing.setType(type);
        productMapper.updateEntityFromDto(dto, existing);
        return repository.save(existing);
    }

    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        repository.deleteById(id);
    }

    public Page<Product> findByTypeId(UUID typeId, Pageable pageable) {
        return repository.findByTypeId(typeId, pageable);
    }

    public Page<Product> findAll(String search, UUID typeId, Pageable pageable) {
        Specification<Product> spec = Specification.where(null);

        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and(productSpecification.search(search));
        }

        if (typeId != null) {
            spec = spec.and(productSpecification.byType(typeId));
        }

        return repository.findAll(spec, pageable);
    }
}