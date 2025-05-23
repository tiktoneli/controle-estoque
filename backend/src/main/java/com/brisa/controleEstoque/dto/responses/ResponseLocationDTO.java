package com.brisa.controleEstoque.dto.responses;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Location response data")
public class ResponseLocationDTO {
    @Schema(description = "Unique identifier of the location", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Name of the location", example = "Warehouse A")
    private String name;

    @Schema(description = "Description of the location", example = "Main storage area for electronics")
    private String description;

    @Schema(description = "Whether the location is active", example = "true")
    private Boolean isActive;

    @Schema(description = "When the location was created", example = "2024-03-20T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "When the location was last updated", example = "2024-03-20T10:00:00")
    private LocalDateTime updatedAt;

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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
} 