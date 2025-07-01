package com.jobwiseai.jobwiseai_backend.service;

import com.jobwiseai.jobwiseai_backend.dto.*;
import com.jobwiseai.jobwiseai_backend.exception.*;
import com.jobwiseai.jobwiseai_backend.model.AuthResponse;
import com.jobwiseai.jobwiseai_backend.model.User;
import com.jobwiseai.jobwiseai_backend.repository.UserRepository;
import com.jobwiseai.jobwiseai_backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register user with email: {}", request.getEmail());

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already in use");
        }

        // Validate user type
        User.UserType userType;
        try {
            userType = User.UserType.valueOf(request.getUserType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new UnauthorizedException("Invalid user type");
        }

        // Encode the password before saving
        String rawPassword = request.getPassword();
        String encodedPassword = passwordEncoder.encode(rawPassword);

        log.info("Password encoding - Raw length: {}, Encoded length: {}",
                rawPassword.length(), encodedPassword.length());

        // Create user with encoded password
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail().toLowerCase())
                .password(encodedPassword)
                .userType(userType)
                .isActive(true)
                .emailVerified(true)
                .build();

        user = userRepository.save(user);
        log.info("User registered successfully with ID: {}", user.getId());

        // Generate tokens
        String token = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        return AuthResponse.builder()
                .user(mapToUserDto(user))
                .token(token)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Attempting to login user with email: {}", request.getEmail());

        try {
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase(),
                            request.getPassword()
                    )
            );

            User user = (User) authentication.getPrincipal();

            // Check if user type matches
            if (!user.getUserType().name().equals(request.getUserType().toUpperCase())) {
                throw new UnauthorizedException("Invalid user type for this account");
            }

            // Check if user is active
            if (!user.isActive()) {
                throw new UnauthorizedException("Account is deactivated");
            }

            log.info("User logged in successfully: {}", user.getEmail());

            // Generate tokens
            String token = jwtUtil.generateToken(user);
            String refreshToken = jwtUtil.generateRefreshToken(user);

            return AuthResponse.builder()
                    .user(mapToUserDto(user))
                    .token(token)
                    .refreshToken(refreshToken)
                    .build();

        } catch (AuthenticationException e) {
            log.error("Authentication failed for email: {} - {}", request.getEmail(), e.getMessage());
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .userType(user.getUserType().name())
                .profilePicture(user.getProfilePicture())
                .isActive(user.isActive())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}