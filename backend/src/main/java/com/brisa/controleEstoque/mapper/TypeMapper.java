package com.brisa.controleEstoque.mapper;

import com.brisa.controleEstoque.dto.requests.RequestTypeDTO;
import com.brisa.controleEstoque.dto.responses.ResponseTypeDTO;
import com.brisa.controleEstoque.entity.Type;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = "spring", 
    unmappedTargetPolicy = ReportingPolicy.WARN,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface TypeMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "description", source = "description")
    Type toEntity(RequestTypeDTO dto);

    @Mapping(target = "description", source = "description")
    ResponseTypeDTO toDto(Type entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "description", source = "description")
    void updateEntityFromDto(RequestTypeDTO dto, @MappingTarget Type entity);
}