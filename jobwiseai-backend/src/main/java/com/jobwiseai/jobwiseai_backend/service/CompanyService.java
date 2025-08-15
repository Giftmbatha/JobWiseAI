package com.jobwiseai.jobwiseai_backend.service;

import com.jobwiseai.jobwiseai_backend.dto.CompanyCreateRequest;
import com.jobwiseai.jobwiseai_backend.model.User;
import com.jobwiseai.jobwiseai_backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@AllArgsConstructor
public class CompanyService {

    private final UserRepository userRepository;

    // Get company details for an employer
    public CompanyCreateRequest getCompanyByEmployer(UUID employerId) {
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new RuntimeException("Employer not found"));

        if (employer.getUserType() != User.UserType.EMPLOYER) {
            throw new RuntimeException("User is not an employer");
        }

        return new CompanyCreateRequest(
                employer.getCompanyName(),
                employer.getCompanyDescription(),
                employer.getCompanyWebsite(),
                employer.getCompanyLogo(),
                employer.getCompanyIndustry(),
                employer.getCompanySize(),
                employer.getCompanyLocation(),
                employer.getCompanyFoundedYear()

        );
    }

    // Create company (store fields inside User)
    public CompanyCreateRequest createCompany(UUID employerId, CompanyCreateRequest request) {
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new RuntimeException("Employer not found"));

        if (employer.getUserType() != User.UserType.EMPLOYER) {
            throw new RuntimeException("User is not an employer");
        }

        // Check if company fields already exist
        if (employer.getCompanyName() != null) {
            throw new RuntimeException("Company already exists for this employer");
        }

        // Save company fields in User
        employer.setCompanyName(request.getCompanyName());
        employer.setCompanyDescription(request.getCompanyDescription());
        employer.setCompanyWebsite(request.getCompanyWebsite());
        employer.setCompanyIndustry(request.getCompanyIndustry());
        employer.setCompanySize(request.getCompanySize());
        employer.setCompanyLocation(request.getCompanyLocation());
        employer.setCompanyFoundedYear(request.getCompanyFoundedYear());
        employer.setCompanyLogo(request.getCompanyLogo());

        userRepository.save(employer);

        return request;
    }

    // Update company fields for an employer
    public CompanyCreateRequest updateCompany(UUID employerId, CompanyCreateRequest request) {
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new RuntimeException("Employer not found"));

        if (employer.getUserType() != User.UserType.EMPLOYER) {
            throw new RuntimeException("User is not an employer");
        }

        // Update company fields
        employer.setCompanyName(request.getCompanyName());
        employer.setCompanyDescription(request.getCompanyDescription());
        employer.setCompanyWebsite(request.getCompanyWebsite());
        employer.setCompanyIndustry(request.getCompanyIndustry());
        employer.setCompanySize(request.getCompanySize());
        employer.setCompanyLocation(request.getCompanyLocation());
        employer.setCompanyFoundedYear(request.getCompanyFoundedYear());
        employer.setCompanyLogo(request.getCompanyLogo());

        userRepository.save(employer);

        return request;
    }
}
