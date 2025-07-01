package com.jobwiseai.jobwiseai_backend.model;

import com.jobwiseai.jobwiseai_backend.dto.UserDto;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String refreshToken;
    private UserDto user;

}