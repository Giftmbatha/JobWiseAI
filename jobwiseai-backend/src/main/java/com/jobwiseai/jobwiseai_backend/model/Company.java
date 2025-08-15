package com.jobwiseai.jobwiseai_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Company name is required")
    @Size(max = 200, message = "Company name must not exceed 200 characters")
    @Column(nullable = false)
    private String CompanyName;

    @Column(columnDefinition = "TEXT")
    private String CompanyDescription;

    @Size(max = 255, message = "Website URL must not exceed 255 characters")
    private String CompanyWebsite;

    @Size(max = 255, message = "Logo URL must not exceed 255 characters")
    private String CompanyLogo;

    @Size(max = 100, message = "Industry must not exceed 100 characters")
    private String CompanyIndustry;

    @Size(max = 50, message = "Company size must not exceed 50 characters")
    private String CompanySize;

    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String CompanyLocation;

    @Min(value = 1800, message = "Founded year must be valid")
    @Max(value = 2100, message = "Founded year must be valid")
    @Column(name = "founded_year")
    private Integer CompanyFoundedYear;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false, unique = true) // enforce one company per employer
    private User employer;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Job> jobs;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
