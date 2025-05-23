package com.brisa.controleEstoque.mapper;

import com.brisa.controleEstoque.dto.requests.RequestProductDTO;
import com.brisa.controleEstoque.dto.responses.ResponseProductDTO;
import com.brisa.controleEstoque.entity.Product;
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
public interface ProductMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "description", source = "description")
    Product toEntity(RequestProductDTO dto);

    @Mapping(target = "typeId", source = "type.id")
    @Mapping(target = "description", source = "description")
    ResponseProductDTO toDto(Product entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "description", source = "description")
    void updateEntityFromDto(RequestProductDTO dto, @MappingTarget Product entity);
}