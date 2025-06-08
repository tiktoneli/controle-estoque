package com.brisa.controleEstoque.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.brisa.controleEstoque.dto.requests.LoginRequestDTO;
import com.brisa.controleEstoque.dto.requests.RegisterRequestDTO;
import com.brisa.controleEstoque.dto.responses.AuthResponseDTO;
import com.brisa.controleEstoque.dto.responses.UserInfoResponseDTO;
import com.brisa.controleEstoque.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        AuthResponseDTO response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        AuthResponseDTO response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserInfoResponseDTO> getCurrentUser() {
        UserInfoResponseDTO response = authService.getCurrentUserInfo();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate-token")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> validateToken() {
        return ResponseEntity.ok("Token is valid");
    }
}