package com.brisa.controleEstoque.mapper;

import com.brisa.controleEstoque.dto.responses.ResponseAttributeDTO;
import com.brisa.controleEstoque.entity.TypeAttribute;
import com.brisa.controleEstoque.entity.Attribute;
import org.springframework.stereotype.Component;

@Component
public class TypeAttributeMapper {
    
    public ResponseAttributeDTO toDto(TypeAttribute typeAttribute, Attribute attribute) {
        ResponseAttributeDTO dto = new ResponseAttributeDTO();
        dto.setId(attribute.getId());
        dto.setName(attribute.getName());
        dto.setDescription(attribute.getDescription());
        dto.setDataType(attribute.getDataType());
        dto.setOptions(attribute.getOptions());
        dto.setCreatedAt(attribute.getCreatedAt());
        dto.setUpdatedAt(attribute.getUpdatedAt());
        dto.setDefaultValue(typeAttribute.getDefaultValue());
        dto.setIsRequired(typeAttribute.getIsRequired());
        dto.setIsUnique(typeAttribute.getIsUnique());
        return dto;
    }
} 