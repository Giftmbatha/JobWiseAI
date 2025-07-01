package com.jobwiseai.jobwiseai_backend.controller;

import com.jobwiseai.jobwiseai_backend.dto.ApiResponse;
import com.jobwiseai.jobwiseai_backend.dto.LoginRequest;
import com.jobwiseai.jobwiseai_backend.dto.RegisterRequest;
import com.jobwiseai.jobwiseai_backend.model.AuthResponse;
import jakarta.validation.Valid;
import com.jobwiseai.jobwiseai_backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.naming.AuthenticationException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request for email: {}", request.getEmail());
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(new ApiResponse<>(true,"User registered successfully",response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) throws AuthenticationException {
        log.info("Login request received fro email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(new ApiResponse<>(true,"Login successful",response));
    }
}