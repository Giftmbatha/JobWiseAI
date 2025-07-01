package com.jobwiseai.jobwiseai_backend.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class LoginRequest {
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email required")
    private String email;

    @NotBlank(message = "Password required")
    private String password;

    @NotBlank(message = "User Role required")
    private String userType; // matches JOB_SEEKER or EMPLOYER
}