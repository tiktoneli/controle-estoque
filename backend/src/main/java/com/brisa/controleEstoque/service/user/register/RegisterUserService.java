package com.brisa.controleEstoque.service.user.register;

import com.brisa.controleEstoque.dto.requests.RequestRegisterUserJson;
import com.brisa.controleEstoque.dto.responses.ResponseRegisteredUserJson;
import com.brisa.controleEstoque.entity.User;
import com.brisa.controleEstoque.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RegisterUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterUserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public ResponseRegisteredUserJson execute(RequestRegisterUserJson request) {

        var encodedPassword = passwordEncoder.encode(request.getPassword());

        var entity = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(encodedPassword)
                .build();

        userRepository.save(entity);

        return ResponseRegisteredUserJson.builder()
                .name(entity.getName())
                .build();

    }
}
