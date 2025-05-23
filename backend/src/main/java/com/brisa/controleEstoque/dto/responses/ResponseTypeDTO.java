package com.brisa.controleEstoque.dto.responses;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

@Schema(description = "Type response data")
public class ResponseTypeDTO {
    @Schema(description = "Unique identifier of the type", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Name of the type", example = "Electronics")
    private String name;

    @Schema(description = "Description of the type", example = "A type of product")
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}