// com/jobwiseai/jobwiseai_backend/dto/CompanyResponse.java
package com.jobwiseai.jobwiseai_backend.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter

@AllArgsConstructor
@Builder
public class CompanyResponse {

    private String companyName;
    private String companyDescription;
    private String companyWebsite;
    private String companyIndustry;
    private String companySize;
    private String companyLocation;
    private Integer companyFoundedYear;
    private String companyLogo;
}
