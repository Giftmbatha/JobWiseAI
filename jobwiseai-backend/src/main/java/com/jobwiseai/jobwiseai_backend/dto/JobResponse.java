package com.jobwiseai.jobwiseai_backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class JobResponse {
    private Long id;
    private String title;
    private String description;
    private List<String> requirements;
    private List<String> responsibilities;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String location;
    private String jobType;
    private String experienceLevel;
    private List<String> skills;
    private List<String> benefits;
    private CompanyDto company;
    private Long employerId;
    private Boolean isActive;
    private LocalDateTime applicationDeadline;
    private Integer applicationsCount;
    private Integer viewsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class CompanyDto {
        private Long id;
        private String name;
        private String description;
        private String website;
        private String logo;
        private String industry;
        private String size;
        private String location;
        private Integer foundedYear;
    }
}
