package com.brisa.controleEstoque.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.brisa.controleEstoque.dto.requests.RequestAttributeDTO;
import com.brisa.controleEstoque.dto.responses.ResponseAttributeDTO;
import com.brisa.controleEstoque.entity.Attribute;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.WARN,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface AttributeMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Attribute toEntity(RequestAttributeDTO dto);

    ResponseAttributeDTO toDto(Attribute entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(RequestAttributeDTO dto, @MappingTarget Attribute entity);
} 