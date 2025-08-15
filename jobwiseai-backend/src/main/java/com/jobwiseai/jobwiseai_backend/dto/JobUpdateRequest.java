package com.jobwiseai.jobwiseai_backend.dto;

import com.jobwiseai.jobwiseai_backend.model.Job;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobUpdateRequest {
    @Size(max = 200, message = "Job title must not exceed 200 characters")
    private String title;
    private String description;
    private List<String> requirements;
    private List<String> responsibilities;
    @DecimalMin(value = "0.0", message = "Minimum salary must be positive")
    private BigDecimal salaryMin;
    @DecimalMax(value = "1000000000.0", message = "Maximum salary must not exceed 1,000,000,000")
    private BigDecimal salaryMax;
    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;
    private String employmentType;
    private String experienceLevel;
    private String industry;
    private List<String> skills;
    private List<String> benefits;
    private LocalDateTime applicationDeadline;
    private Boolean isActive;
}
