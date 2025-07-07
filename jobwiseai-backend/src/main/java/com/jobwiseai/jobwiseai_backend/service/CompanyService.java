package com.jobwiseai.jobwiseai_backend.service;

import com.jobwiseai.jobwiseai_backend.dto.CompanyCreateRequest;
import com.jobwiseai.jobwiseai_backend.exception.ResourceAlreadyExistsException;
import com.jobwiseai.jobwiseai_backend.exception.ResourceNotFoundException;
import com.jobwiseai.jobwiseai_backend.exception.UnauthorizedException;
import com.jobwiseai.jobwiseai_backend.model.Company;
import com.jobwiseai.jobwiseai_backend.model.User;
import com.jobwiseai.jobwiseai_backend.repository.CompanyRepository;
import com.jobwiseai.jobwiseai_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Transactional
    public Company createCompany(CompanyCreateRequest request, UUID employerId) {
        log.info("Creating company for employer ID: {}", employerId);

        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));

        if (employer.getUserType() != User.UserType.EMPLOYER) {
            throw new UnauthorizedException("Only employers can create companies");
        }

        if (companyRepository.existsByEmployer(employer)) {
            throw new ResourceAlreadyExistsException("Company already exists for this employer");
        }

        Company company = Company.builder()
                .name(request.getName())
                .description(request.getDescription())
                .website(request.getWebsite())
                .logo(request.getLogo())
                .industry(request.getIndustry())
                .size(request.getSize())
                .location(request.getLocation())
                .foundedYear(request.getFoundedYear())
                .employer(employer)
                .build();

        company = companyRepository.save(company);
        log.info("Company created successfully with ID: {}", company.getId());

        return company;
    }

    @Transactional(readOnly = true)
    public Company getCompanyByEmployer(UUID employerId) {
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));

        return companyRepository.findByEmployer(employer)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found for this employer"));
    }
}