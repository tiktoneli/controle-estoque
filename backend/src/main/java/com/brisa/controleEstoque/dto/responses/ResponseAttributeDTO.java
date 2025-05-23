package com.brisa.controleEstoque.dto.responses;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.UUID;

import com.brisa.controleEstoque.entity.enums.AttributeDataType;

@Schema(description = "Attribute response data")
public class ResponseAttributeDTO {
    @Schema(description = "Unique identifier of the attribute", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Name of the attribute", example = "Color")
    private String name;

    @Schema(description = "Description of the attribute", example = "The color of the item")
    private String description;

    @Schema(description = "Data type of the attribute", example = "STRING")
    private com.brisa.controleEstoque.entity.enums.AttributeDataType dataType;

    @Schema(description = "Comma-separated options for SELECT data type", example = "blue,yellow,red")
    private String options;

    @Schema(description = "When the attribute was created", example = "2024-03-20T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "When the attribute was last updated", example = "2024-03-20T10:00:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Whether the attribute is required for this type", example = "true")
    private Boolean isRequired;

    @Schema(description = "Default value for this attribute in this type", example = "blue")
    private String defaultValue;

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

    public AttributeDataType getDataType() {
        return dataType;
    }

    public void setDataType(AttributeDataType dataType) {
        this.dataType = dataType;
    }

    public String getOptions() {
        return options;
    }

    public void setOptions(String options) {
        this.options = options;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getIsRequired() {
        return isRequired;
    }

    public void setIsRequired(Boolean isRequired) {
        this.isRequired = isRequired;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }
} 