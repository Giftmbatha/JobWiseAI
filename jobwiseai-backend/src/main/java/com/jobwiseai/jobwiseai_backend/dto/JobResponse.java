package com.jobwiseai.jobwiseai_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobResponse {
    private UUID id;
    private String title;
    private String description;
    private List<String> requirements;
    private List<String> responsibilities;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String location;
    private String employmentType;
    private String experienceLevel;
    private String industry;
    private List<String> skills;
    private List<String> benefits;
    private CompanyInfo company;
    private UUID employerId;
    private Boolean isActive;
    private LocalDateTime applicationDeadline;
    private Integer applicationsCount;
    private Integer viewsCount;
    private LocalDateTime postedDate;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CompanyInfo {
        private UUID id;
        private String name;
        private String logoUrl;
        private String location;
    }
}
