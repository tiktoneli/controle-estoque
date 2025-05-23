package com.brisa.controleEstoque.dto.requests;

import com.brisa.controleEstoque.entity.enums.AttributeDataType;
import com.brisa.controleEstoque.exceptions.ResourceBadRequestException;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.UUID;

public class RequestTypeAttributeDTO {
    private UUID attributeId; // Optional: use existing attribute

    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    private String name; // Optional: for new attribute

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    private AttributeDataType dataType; // Optional: for new attribute

    @NotNull(message = "isRequired is required")
    private Boolean isRequired;

    private String defaultValue;

    private String options; // Comma-separated options for SELECT data type

    public void validate() {
        if (attributeId == null) {
            // New attribute validation
            if (name == null || dataType == null) {
                throw new ResourceBadRequestException("Name and dataType are required for new attributes");
            }

            // Validate options for SELECT type
            if (dataType == AttributeDataType.SELECT) {
                if (options == null || options.trim().isEmpty()) {
                    throw new ResourceBadRequestException("Options are required for SELECT data type");
                }
            }
        }
    }

    public UUID getAttributeId() {
        return attributeId;
    }

    public void setAttributeId(UUID attributeId) {
        this.attributeId = attributeId;
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

    public String getOptions() {
        return options;
    }

    public void setOptions(String options) {
        this.options = options;
    }
}