package com.brisa.controleEstoque.service;

import com.brisa.controleEstoque.dto.requests.RequestTypeAttributeDTO;
import com.brisa.controleEstoque.dto.responses.ResponseAttributeDTO;
import com.brisa.controleEstoque.entity.Attribute;
import com.brisa.controleEstoque.entity.TypeAttribute;
import com.brisa.controleEstoque.entity.Type;
import com.brisa.controleEstoque.entity.enums.AttributeDataType;
import com.brisa.controleEstoque.event.TypeDeletedEvent;
import com.brisa.controleEstoque.exceptions.ResourceBadRequestException;
import com.brisa.controleEstoque.exceptions.ResourceNotFoundException;
import com.brisa.controleEstoque.mapper.TypeAttributeMapper;
import com.brisa.controleEstoque.repository.AttributeRepository;
import com.brisa.controleEstoque.repository.TypeAttributeRepository;
import org.springframework.context.event.EventListener;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TypeAttributeService {
    private final TypeAttributeRepository typeAttributeRepository;
    private final AttributeRepository attributeRepository;
    private final TypeService typeService;
    private final AttributeService attributeService;
    private final TypeAttributeMapper typeAttributeMapper;

    public TypeAttributeService(
            TypeAttributeRepository typeAttributeRepository,
            AttributeRepository attributeRepository,
            TypeService typeService,
            AttributeService attributeService,
            TypeAttributeMapper typeAttributeMapper) {
        this.typeAttributeRepository = typeAttributeRepository;
        this.attributeRepository = attributeRepository;
        this.typeService = typeService;
        this.attributeService = attributeService;
        this.typeAttributeMapper = typeAttributeMapper;
    }

    public List<ResponseAttributeDTO> getAttributesForType(UUID typeId) {
        typeService.findById(typeId); // Validate type exists
        return typeAttributeRepository.findAll().stream()
                .filter(ta -> ta.getId().getTypeId().equals(typeId))
                .map(ta -> {
                    Attribute attribute = attributeService.findById(ta.getId().getAttributeId());
                    return typeAttributeMapper.toDto(ta, attribute);
                })
                .collect(Collectors.toList());
    }

    public ResponseAttributeDTO addAttributeToType(UUID typeId, RequestTypeAttributeDTO dto) {
        Type type = typeService.findById(typeId);
        dto.validate();

        // Use AttributeService for all attribute logic
        Attribute attribute = attributeService.getOrCreateAttribute(dto);
        TypeAttribute typeAttribute = createTypeAttribute(type, attribute, dto);

        return typeAttributeMapper.toDto(typeAttribute, attribute);
    }

    private TypeAttribute createTypeAttribute(Type type, Attribute attribute, RequestTypeAttributeDTO dto) {
        TypeAttribute.TypeAttributeId id = new TypeAttribute.TypeAttributeId(type.getId(), attribute.getId());

        if (typeAttributeRepository.existsById(id)) {
            throw new ResourceBadRequestException("This attribute is already associated with the type.");
        }

        // Validate default value before creating the type attribute
        validateDefaultValue(dto.getDefaultValue(), attribute.getDataType(), attribute.getOptions());

        TypeAttribute typeAttribute = TypeAttribute.builder()
                .id(id)
                .type(type)
                .attribute(attribute)
                .isRequired(dto.getIsRequired())
                .defaultValue(dto.getDefaultValue())
                .build();

        return typeAttributeRepository.save(typeAttribute);
    }

    public ResponseAttributeDTO updateTypeAttributeSettings(UUID typeId, UUID attributeId,
            RequestTypeAttributeDTO dto) {
        TypeAttribute.TypeAttributeId id = new TypeAttribute.TypeAttributeId(typeId, attributeId);
        final TypeAttribute ta = typeAttributeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Association not found for type and attribute."));

        // Get the attribute to validate against its data type
        Attribute attribute = attributeService.findById(attributeId);

        boolean changed = false;
        if (dto.getIsRequired() != null) {
            ta.setIsRequired(dto.getIsRequired());
            changed = true;
        }
        if (dto.getDefaultValue() != null) {
            // Validate the new default value against the attribute's data type
            validateDefaultValue(dto.getDefaultValue(), attribute.getDataType(), attribute.getOptions());
            ta.setDefaultValue(dto.getDefaultValue());
            changed = true;
        }

        final TypeAttribute updatedTa = changed ? typeAttributeRepository.save(ta) : ta;
        return typeAttributeMapper.toDto(updatedTa, attribute);
    }

    public void removeAttributeFromType(UUID typeId, UUID attributeId) {
        TypeAttribute.TypeAttributeId id = new TypeAttribute.TypeAttributeId(typeId, attributeId);
        if (!typeAttributeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Association not found for type and attribute.");
        }
        typeAttributeRepository.deleteById(id);
    }

    @EventListener
    public void handleTypeDeletedEvent(TypeDeletedEvent event) {
        UUID typeId = event.getTypeId();
        List<TypeAttribute> associations = typeAttributeRepository.findAll().stream()
                .filter(ta -> ta.getId().getTypeId().equals(typeId))
                .collect(Collectors.toList());
        typeAttributeRepository.deleteAll(associations);
    }

    private void validateDefaultValue(String defaultValue, AttributeDataType dataType, String options) {
        // Skip validation if defaultValue is null or empty
        if (defaultValue == null || defaultValue.trim().isEmpty()) {
            return;
        }

        try {
            switch (dataType) {
                case NUMBER:
                    Double.parseDouble(defaultValue);
                    break;
                case BOOLEAN:
                    Boolean.parseBoolean(defaultValue);
                    break;
                case DATE:
                    LocalDate.parse(defaultValue);
                    break;
                case SELECT:
                    if (options != null && !Arrays.asList(options.split(",")).contains(defaultValue)) {
                        throw new ResourceBadRequestException("Default value must be one of the defined options");
                    }
                    break;
                // STRING and JSON don't need validation
            }
        } catch (Exception e) {
            throw new ResourceBadRequestException("Default value is not valid for data type: " + dataType);
        }
    }
}