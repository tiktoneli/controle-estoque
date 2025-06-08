package com.brisa.controleEstoque.mapper;

import com.brisa.controleEstoque.dto.requests.RequestLotDTO;
import com.brisa.controleEstoque.dto.responses.ResponseLotDTO;
import com.brisa.controleEstoque.entity.Lot;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;
import org.springframework.stereotype.Component;

@Component
@Mapper(
    componentModel = "spring", 
    unmappedTargetPolicy = ReportingPolicy.WARN,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface LotMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Lot toEntity(RequestLotDTO dto);

    @Mapping(target = "productId", source = "product.id")
    ResponseLotDTO toDto(Lot entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(RequestLotDTO dto, @MappingTarget Lot entity);
}
