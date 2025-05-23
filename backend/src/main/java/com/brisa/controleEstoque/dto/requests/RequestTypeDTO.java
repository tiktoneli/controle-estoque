package com.brisa.controleEstoque.dto.requests;

import com.brisa.controleEstoque.config.validation.OnCreate;
import com.brisa.controleEstoque.config.validation.OnUpdate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RequestTypeDTO {
    @NotBlank(message = "Name is required for creation", groups = OnCreate.class)
    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters", groups = {OnCreate.class, OnUpdate.class})
    private String name;

    private String description;

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