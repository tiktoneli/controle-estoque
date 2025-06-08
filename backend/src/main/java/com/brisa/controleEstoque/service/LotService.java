package com.brisa.controleEstoque.service;

import com.brisa.controleEstoque.dto.requests.RequestLotDTO;
import com.brisa.controleEstoque.entity.Lot;
import com.brisa.controleEstoque.entity.Product;
import com.brisa.controleEstoque.exceptions.ResourceNotFoundException;
import com.brisa.controleEstoque.mapper.LotMapper;
import com.brisa.controleEstoque.repository.LotRepository;
import com.brisa.controleEstoque.repository.ProductRepository;
import com.brisa.controleEstoque.repository.specification.LotSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class LotService {

    private final LotRepository repository;
    private final ProductRepository productRepository;
    private final LotMapper mapper;

    public LotService(LotRepository repository, ProductRepository productRepository, LotMapper mapper) {
        this.repository = repository;
        this.productRepository = productRepository;
        this.mapper = mapper;
    }

    public Page<Lot> findAll(String search, UUID productId, LocalDateTime manufacturingStartDate, 
            LocalDateTime manufacturingEndDate, LocalDateTime expirationStartDate, 
            LocalDateTime expirationEndDate, Pageable pageable) {
        
        Specification<Lot> spec = Specification.where(LotSpecification.searchByLotNumber(search))
            .and(LotSpecification.searchByProductId(productId))
            .and(LotSpecification.searchByManufacturingDate(manufacturingStartDate, manufacturingEndDate))
            .and(LotSpecification.searchByExpirationDate(expirationStartDate, expirationEndDate));
        
        return repository.findAll(spec, pageable);
    }

    public Lot findById(UUID id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lot not found with id: " + id));
    }

    public Lot create(RequestLotDTO dto) {
        Product product = productRepository.findById(dto.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));
        
        Lot lot = mapper.toEntity(dto);
        lot.setProduct(product);
        return repository.save(lot);
    }

    public Lot update(UUID id, RequestLotDTO dto) {
        Lot existing = findById(id);
        Product product = productRepository.findById(dto.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + dto.getProductId()));
        
        mapper.updateEntityFromDto(dto, existing);
        existing.setProduct(product);
        return repository.save(existing);
    }

    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Lot not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
