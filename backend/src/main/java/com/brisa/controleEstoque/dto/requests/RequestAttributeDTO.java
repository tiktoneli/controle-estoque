package com.brisa.controleEstoque.dto.requests;

import com.brisa.controleEstoque.config.validation.OnCreate;
import com.brisa.controleEstoque.config.validation.OnUpdate;
import com.brisa.controleEstoque.entity.enums.AttributeDataType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RequestAttributeDTO {
    @NotBlank(message = "Name is required for creation", groups = OnCreate.class)
    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters", groups = {OnCreate.class, OnUpdate.class})
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters", groups = {OnCreate.class, OnUpdate.class})
    private String description;

    @NotNull(message = "Data type is required", groups = OnCreate.class)
    private AttributeDataType dataType;

    private String options; // Comma-separated options for SELECT data type

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
} 