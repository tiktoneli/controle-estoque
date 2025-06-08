package com.brisa.controleEstoque.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brisa.controleEstoque.dto.requests.LoginRequestDTO;
import com.brisa.controleEstoque.dto.requests.RegisterRequestDTO;
import com.brisa.controleEstoque.dto.responses.AuthResponseDTO;
import com.brisa.controleEstoque.dto.responses.UserInfoResponseDTO;
import com.brisa.controleEstoque.entity.User;
import com.brisa.controleEstoque.entity.enums.Role;
import com.brisa.controleEstoque.exceptions.EmailAlreadyExistsException;
import com.brisa.controleEstoque.exceptions.InvalidCredentialsException;
import com.brisa.controleEstoque.repository.UserRepository;
import com.brisa.controleEstoque.security.JwtUtil;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponseDTO login(LoginRequestDTO request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            User user = (User) authentication.getPrincipal();
            String token = jwtUtil.generateToken(user);

            log.info("User {} logged in successfully", user.getEmail());

            return AuthResponseDTO.builder()
                    .token(token)
                    .email(user.getEmail())
                    .displayName(user.getDisplayName())
                    .role(user.getRole())
                    .id(user.getId())
                    .build();

        } catch (BadCredentialsException e) {
            log.warn("Failed login attempt for email: {}", request.getEmail());
            throw new InvalidCredentialsException("Invalid email or password");
        }
    }

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already registered");
        }

        // For now, allow direct registration. Later we'll restrict this to
        // invitation-only
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .role(request.getRole())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser);

        log.info("New user registered: {}", savedUser.getEmail());

        return AuthResponseDTO.builder()
                .token(token)
                .email(savedUser.getEmail())
                .displayName(savedUser.getDisplayName())
                .role(savedUser.getRole())
                .id(savedUser.getId())
                .build();
    }

    public UserInfoResponseDTO getCurrentUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        return UserInfoResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .role(user.getRole())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public void createSuperUser(String email, String password, String displayName) {
        if (userRepository.countSuperUsers() > 0) {
            throw new IllegalStateException("Super user already exists");
        }

        User superUser = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .displayName(displayName)
                .role(Role.ADMIN)
                .isActive(true)
                .build();

        userRepository.save(superUser);
        log.info("Super user created: {}", email);
    }
}