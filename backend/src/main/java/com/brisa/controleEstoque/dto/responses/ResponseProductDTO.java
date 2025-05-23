package com.brisa.controleEstoque.dto.responses;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

@Schema(description = "Product response data")
public class ResponseProductDTO {
    @Schema(description = "Unique identifier of the product", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Name of the product", example = "Laptop")
    private String name;

    @Schema(description = "ID of the product type this product belongs to", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID typeId;

    @Schema(description = "Description of the product", example = "A powerful laptop with a 15.6 inch screen")
    private String description;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UUID getTypeId() {
        return typeId;
    }

    public void setTypeId(UUID typeId) {
        this.typeId = typeId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}