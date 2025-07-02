package com.jobwiseai.jobwiseai_backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Data
public class JobCreateRequest {

    @NotBlank(message = "Job title is required")
    @Size(max = 200, message = "Job title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Job description is required")
    private String description;

    @NotEmpty(message = "At least one requirement is needed")
    private List<String> requirements;

    @NotEmpty(message = "At least one responsibility is needed")
    private List<String> responsibilities;

    @DecimalMin(value = "0.0", message = "Minimum salary must be positive")
    private BigDecimal salaryMin;

    @DecimalMin(value = "0.0", message = "Maximum salary must be positive")
    private BigDecimal salaryMax;

    @NotBlank(message = "Location is required")
    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;

    @NotBlank(message = "Job type is required")
    private String jobType;

    @NotBlank(message = "Experience level is required")
    private String experienceLevel;

    @NotEmpty(message = "At least one skill is required")
    private List<String> skills;

    private List<String> benefits;

    private LocalDateTime applicationDeadline;

    // Validation method
    @AssertTrue(message = "Maximum salary must be greater than minimum salary")
    public boolean isSalaryRangeValid() {
        if (salaryMin != null && salaryMax != null) {
            return salaryMax.compareTo(salaryMin) >= 0;
        }
        return true;
    }
}
