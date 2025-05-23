package com.brisa.controleEstoque.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.brisa.controleEstoque.dto.requests.RequestLocationDTO;
import com.brisa.controleEstoque.dto.responses.ResponseLocationDTO;
import com.brisa.controleEstoque.entity.Location;

@Mapper(
    componentModel = "spring", 
    unmappedTargetPolicy = ReportingPolicy.WARN,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface LocationMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Location toEntity(RequestLocationDTO dto);

    ResponseLocationDTO toDto(Location entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(RequestLocationDTO dto, @MappingTarget Location entity);
}
