package com.jobwiseai.jobwiseai_backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CompanyCreateRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 200, message = "Company name must not exceed 200 characters")
    private String companyName;

    private String companyDescription;

    @Size(max = 255, message = "Website URL must not exceed 255 characters")
    private String companyWebsite;

    @Size(max = 255, message = "Logo URL must not exceed 255 characters")
    private String companyLogo;

    @Size(max = 100, message = "Industry must not exceed 100 characters")
    private String companyIndustry;

    @Size(max = 50, message = "Company size must not exceed 50 characters")
    private String companySize;

    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String companyLocation;

    @Min(value = 1800, message = "Founded year must be valid")
    @Max(value = 2100, message = "Founded year must be valid")
    private Integer companyFoundedYear;
}
