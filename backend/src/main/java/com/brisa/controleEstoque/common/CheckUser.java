package com.brisa.controleEstoque.common;

import org.springframework.security.core.context.SecurityContextHolder;

import com.brisa.controleEstoque.entity.User;

public class CheckUser {
    public static User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
