package com.jobwiseai.jobwiseai_backend.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message="First name required")
    private String firstName;

    @NotBlank(message="First name required")
    private String lastName;

    @NotBlank(message="Email required")
    @Email(message = "Invalid format")
    private String email;

    @NotBlank(message="Password required")
    private String password;

    @NotBlank(message="Role required")
    private String userType;

    private String CompanyName;
}
