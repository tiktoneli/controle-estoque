package com.brisa.controleEstoque.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.JoinColumn;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TypeAttribute {
    @EmbeddedId
    private TypeAttributeId id;

    @ManyToOne
    @MapsId("typeId")
    @JoinColumn(name = "type_id", nullable = false)
    private Type type;

    @ManyToOne
    @MapsId("attributeId")
    @JoinColumn(name = "attribute_id", nullable = false)
    private Attribute attribute;

    private Boolean isRequired = false;
    private String defaultValue;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Embeddable
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @EqualsAndHashCode
    public static class TypeAttributeId implements Serializable {
        @Column(nullable = false)
        private UUID typeId;
        @Column(nullable = false)
        private UUID attributeId;
    }
} 