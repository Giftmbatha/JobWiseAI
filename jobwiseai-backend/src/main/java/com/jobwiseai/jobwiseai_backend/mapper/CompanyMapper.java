/*package com.jobwiseai.jobwiseai_backend.mapper;

import com.jobwiseai.jobwiseai_backend.dto.CompanyCreateRequest;
import com.jobwiseai.jobwiseai_backend.dto.CompanyResponse;
import com.jobwiseai.jobwiseai_backend.model.Company;
import com.jobwiseai.jobwiseai_backend.model.User;

public final class CompanyMapper {

    private CompanyMapper() {}

    public static Company toEntity(CompanyCreateRequest req, User employer) {
        return Company.builder()
                .CompanyName(req.getCompanyName())
                .CompanyDescription(req.getCompanyDescription())
                .CompanyWebsite(req.getCompanyWebsite())
                .CompanyLogo(req.getCompanyLogo())
                .CompanyIndustry(req.getCompanyIndustry())
                .CompanySize(req.getCompanySize())
                .CompanyLocation(req.getCompanyLocation())
                .CompanyFoundedYear(req.getCompanyFoundedYear())
                .employer(employer)
                .build();
    }

    public static CompanyResponse toResponse(Company c) {
        return CompanyResponse.builder()
                .id(c.getId())
                .companyName(c.getCompanyName())
                .companyDescription(c.getCompanyDescription())
                .companyWebsite(c.getCompanyWebsite())
                .companyIndustry(c.getCompanyIndustry())
                .companySize(c.getCompanySize())
                .companyLocation(c.getCompanyLocation())
                .companyFoundedYear(c.getCompanyFoundedYear())
                .companyLogo(c.getCompanyLogo())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}*/
