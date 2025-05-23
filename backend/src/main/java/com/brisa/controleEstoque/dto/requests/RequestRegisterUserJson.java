package com.brisa.controleEstoque.dto.requests;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RequestRegisterUserJson {

    private String name;
    private String username;
    @Email(message = "Email inválido")
    private String email;
    private String password;
}
