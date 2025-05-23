package com.brisa.controleEstoque.service;

import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brisa.controleEstoque.dto.requests.RequestAttributeDTO;
import com.brisa.controleEstoque.dto.requests.RequestTypeAttributeDTO;
import com.brisa.controleEstoque.entity.Attribute;
import com.brisa.controleEstoque.exceptions.ResourceBadRequestException;
import com.brisa.controleEstoque.exceptions.ResourceNotFoundException;
import com.brisa.controleEstoque.mapper.AttributeMapper;
import com.brisa.controleEstoque.repository.AttributeRepository;
import com.brisa.controleEstoque.repository.TypeAttributeRepository;

@Service
@Transactional
public class AttributeService {
    private final AttributeRepository attributeRepository;
    private final AttributeMapper attributeMapper;
    private final TypeAttributeRepository typeAttributeRepository;

    public AttributeService(AttributeRepository attributeRepository, AttributeMapper attributeMapper, TypeAttributeRepository typeAttributeRepository) {
        this.attributeRepository = attributeRepository;
        this.attributeMapper = attributeMapper;
        this.typeAttributeRepository = typeAttributeRepository;
    }

    public Page<Attribute> findAll(Pageable pageable) {
        return attributeRepository.findAll(pageable);
    }

    public Attribute findById(UUID id) {
        return attributeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Attribute not found with id: " + id));
    }

    public Attribute create(RequestAttributeDTO dto) {
        try {
            Attribute attribute = attributeMapper.toEntity(dto);
            return attributeRepository.save(attribute);
        } catch (DataIntegrityViolationException e) {
            if (e.getMessage().contains("unique constraint")) {
                throw new ResourceBadRequestException("Attribute name has to be unique.");
            }
            if (e.getMessage().contains("not-null constraint")) {
                throw new ResourceBadRequestException("Attribute name and data type must not be null.");
            }
            throw e;
        }
    }

    public Attribute update(UUID id, RequestAttributeDTO dto) {
        Attribute existing = findById(id);
        try {
            attributeMapper.updateEntityFromDto(dto, existing);
            return attributeRepository.save(existing);
        } catch (DataIntegrityViolationException e) {
            if (e.getMessage().contains("unique constraint")) {
                throw new ResourceBadRequestException("Attribute name has to be unique.");
            }
            throw e;
        }
    }

    public void delete(UUID id) {
        if (typeAttributeRepository.existsByIdAttributeId(id)) {
            throw new ResourceBadRequestException("Cannot delete attribute: it is still linked to one or more types.");
        }
        if (!attributeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Attribute not found with id: " + id);
        }
        attributeRepository.deleteById(id);
    }

    // --- Begin moved logic from TypeAttributeService ---
    public Attribute getOrCreateAttribute(RequestTypeAttributeDTO dto) {
        if (dto.getAttributeId() != null) {
            return findById(dto.getAttributeId());
        }
        return dto.getDataType() == com.brisa.controleEstoque.entity.enums.AttributeDataType.SELECT
                ? getOrCreateSelectAttribute(dto)
                : getOrCreateNonSelectAttribute(dto);
    }

    private Attribute getOrCreateSelectAttribute(RequestTypeAttributeDTO dto) {
        String normalizedOptions = normalizeOptions(dto.getOptions());
        return attributeRepository.findByNameAndDataTypeAndOptions(
                dto.getName(),
                (com.brisa.controleEstoque.entity.enums.AttributeDataType) dto.getDataType(),
                normalizedOptions).orElseGet(() -> createNewAttribute(dto, normalizedOptions));
    }

    private Attribute getOrCreateNonSelectAttribute(RequestTypeAttributeDTO dto) {
        return attributeRepository.findByNameAndDataType(dto.getName(), dto.getDataType())
                .orElseGet(() -> createNewAttribute(dto, null));
    }

    private String normalizeOptions(String options) {
        if (options == null)
            return null;
        String[] optionArray = options.split(",");
        for (int i = 0; i < optionArray.length; i++) {
            optionArray[i] = optionArray[i].trim();
        }
        java.util.Arrays.sort(optionArray);
        return String.join(",", optionArray);
    }

    private Attribute createNewAttribute(RequestTypeAttributeDTO dto, String normalizedOptions) {
        try {
            Attribute newAttr = Attribute.builder()
                    .name(dto.getName())
                    .description(dto.getDescription())
                    .dataType((com.brisa.controleEstoque.entity.enums.AttributeDataType) dto.getDataType())
                    .options(normalizedOptions)
                    .build();
            return attributeRepository.save(newAttr);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            String errorMessage = normalizedOptions != null
                    ? String.format("An attribute with name '%s', data type '%s', and options '%s' already exists. " +
                            "Please use different options or a different name.",
                            dto.getName(), dto.getDataType(), normalizedOptions)
                    : String.format("An attribute with name '%s' and data type '%s' already exists. " +
                            "Please use a different name or data type.",
                            dto.getName(), dto.getDataType());
            throw new ResourceBadRequestException(errorMessage);
        }
    }
    // --- End moved logic from TypeAttributeService ---
} 