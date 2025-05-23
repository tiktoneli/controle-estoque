package com.brisa.controleEstoque.controller;

import com.brisa.controleEstoque.dto.requests.RequestRegisterUserJson;
import com.brisa.controleEstoque.dto.responses.ResponseRegisteredUserJson;
import com.brisa.controleEstoque.service.user.register.RegisterUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final RegisterUserService registerUserService;

    public UserController(RegisterUserService registerUserService) {
        this.registerUserService = registerUserService;
    }

    @PostMapping("/")
    public ResponseEntity<ResponseRegisteredUserJson> register(@Valid @RequestBody RequestRegisterUserJson request) {
        var response = registerUserService.execute(request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(response.getName())
                .toUri();
        return ResponseEntity.created(uri).body(response);
    }
}
