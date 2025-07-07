package com.jobwiseai.jobwiseai_backend.controller;

import com.jobwiseai.jobwiseai_backend.dto.ApiResponse;
import com.jobwiseai.jobwiseai_backend.dto.CompanyCreateRequest;
import com.jobwiseai.jobwiseai_backend.model.Company;
import com.jobwiseai.jobwiseai_backend.model.User;
import com.jobwiseai.jobwiseai_backend.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Slf4j
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping
    public ResponseEntity<ApiResponse<Company>> createCompany(
            @Valid @RequestBody CompanyCreateRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Company creation request received from employer: {}", currentUser.getEmail());

        Company company = companyService.createCompany(request, currentUser.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Company created successfully", company));
    }

    @GetMapping("/my-company")
    public ResponseEntity<ApiResponse<Company>> getMyCompany(
            @AuthenticationPrincipal User currentUser) {

        log.info("Getting company for employer: {}", currentUser.getEmail());

        Company company = companyService.getCompanyByEmployer(currentUser.getId());

        return ResponseEntity.ok(new ApiResponse<>(true, "Company retrieved successfully", company));
    }
}