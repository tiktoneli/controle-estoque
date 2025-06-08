package com.brisa.controleEstoque.entity.enums;

import org.springframework.security.core.GrantedAuthority;

public enum Role implements GrantedAuthority {
    ADMIN("ROLE_ADMIN"),
    MANAGER("ROLE_MANAGER"),
    AUDITOR("ROLE_AUDITOR"),
    USER("ROLE_USER"),
    VISITOR("ROLE_VISITOR");

    private final String authority;

    Role(String authority) {
        this.authority = authority;
    }

    @Override
    public String getAuthority() {
        return authority;
    }
}