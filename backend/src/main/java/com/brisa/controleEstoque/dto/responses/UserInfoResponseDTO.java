package com.brisa.controleEstoque.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

import com.brisa.controleEstoque.entity.enums.Role;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponseDTO {
    private UUID id;
    private String email;
    private String displayName;
    private Role role;
    private boolean isActive;
    private LocalDateTime createdAt;
}