package com.brisa.controleEstoque.service;

import com.brisa.controleEstoque.dto.requests.RequestTypeDTO;
import com.brisa.controleEstoque.entity.Type;
import com.brisa.controleEstoque.event.TypeDeletedEvent;
import com.brisa.controleEstoque.exceptions.ResourceBadRequestException;
import com.brisa.controleEstoque.exceptions.ResourceNotFoundException;
import com.brisa.controleEstoque.mapper.TypeMapper;
import com.brisa.controleEstoque.repository.TypeRepository;
import com.brisa.controleEstoque.repository.TypeAttributeRepository;
import com.brisa.controleEstoque.repository.specification.TypeSpecification;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TypeService {
    private final TypeRepository typeRepository;
    private final TypeMapper typeMapper;
    private final TypeSpecification typeSpecification;
    private final TypeAttributeRepository typeAttributeRepository;
    private final ApplicationEventPublisher eventPublisher;

    public TypeService(
            TypeRepository typeRepository, 
            TypeMapper typeMapper,
            TypeAttributeRepository typeAttributeRepository,
            ApplicationEventPublisher eventPublisher) {
        this.typeRepository = typeRepository;
        this.typeMapper = typeMapper;
        this.typeSpecification = new TypeSpecification();
        this.typeAttributeRepository = typeAttributeRepository;
        this.eventPublisher = eventPublisher;
    }

    public Page<Type> findAll(String search, Pageable pageable) {
        Specification<Type> spec = Specification.where(null);
        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and(typeSpecification.search(search));
        }
        return typeRepository.findAll(spec, pageable);
    }

    public Type findById(UUID id) {
        return typeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Type not found with id: " + id));
    }

    public Type create(RequestTypeDTO dto) {
        try {
            Type type = typeMapper.toEntity(dto);
            return typeRepository.save(type);
        } catch (DataIntegrityViolationException e) {
            if (e.getMessage().contains("unique constraint")) {
                throw new ResourceBadRequestException("Type name has to be unique.");
            }
            if (e.getMessage().contains("not-null constraint")) {
                throw new ResourceBadRequestException("Type name not specified, must not be null.");
            }
            throw e;
        }
    }

    public Type update(UUID id, RequestTypeDTO dto) {
        Type existing = findById(id);
        try {
            typeMapper.updateEntityFromDto(dto, existing);
            return typeRepository.save(existing);
        } catch (DataIntegrityViolationException e) {
            if (e.getMessage().contains("unique constraint")) {
                throw new ResourceBadRequestException("Type name has to be unique.");
            }
            throw e;
        }
    }

    public void delete(UUID id) {
        if (!typeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Type not found with id: " + id);
        }
        // Publish event before deleting the type
        eventPublisher.publishEvent(new TypeDeletedEvent(id));
        // Delete all associated type attributes first
        typeAttributeRepository.deleteAll(
            typeAttributeRepository.findAll().stream()
                .filter(ta -> ta.getId().getTypeId().equals(id))
                .collect(Collectors.toList())
        );
        typeRepository.deleteById(id);
    }
}