package com.brisa.controleEstoque.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.brisa.controleEstoque.service.AuthService;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationStartup implements CommandLineRunner {

    private final AuthService authService;

    @Value("${app.superuser.email:admin@yourapp.com}")
    private String superUserEmail;

    @Value("${app.superuser.password:SuperSecretPassword123!}")
    private String superUserPassword;

    @Value("${app.superuser.displayName:Super Administrator}")
    private String superUserDisplayName;

    @Value("${app.superuser.create-on-startup:true}")
    private boolean createSuperUserOnStartup;

    @Override
    public void run(String... args) {
        if (createSuperUserOnStartup) {
            try {
                authService.createSuperUser(superUserEmail, superUserPassword, superUserDisplayName);
                log.info("=".repeat(50));
                log.info("SUPER USER CREATED SUCCESSFULLY");
                log.info("Email: {}", superUserEmail);
                log.info("Password: {}", superUserPassword);
                log.info("PLEASE CHANGE THE DEFAULT PASSWORD IMMEDIATELY!");
                log.info("=".repeat(50));
            } catch (IllegalStateException e) {
                log.info("Super user already exists, skipping creation");
            } catch (Exception e) {
                log.error("Failed to create super user", e);
            }
        }
    }
}