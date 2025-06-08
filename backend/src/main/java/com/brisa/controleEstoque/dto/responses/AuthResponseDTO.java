package com.brisa.controleEstoque.dto.responses;

import java.util.UUID;

import com.brisa.controleEstoque.entity.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String type = "Bearer";
    private String email;
    private String displayName;
    private Role role;
    private UUID id;
}