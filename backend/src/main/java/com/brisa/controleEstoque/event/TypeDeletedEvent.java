package com.brisa.controleEstoque.event;

import java.util.UUID;

public class TypeDeletedEvent {
    private final UUID typeId;

    public TypeDeletedEvent(UUID typeId) {
        this.typeId = typeId;
    }

    public UUID getTypeId() {
        return typeId;
    }
} 