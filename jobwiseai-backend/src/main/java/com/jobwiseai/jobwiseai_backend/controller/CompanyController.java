package com.jobwiseai.jobwiseai_backend.controller;

import com.jobwiseai.jobwiseai_backend.dto.CompanyCreateRequest;
import com.jobwiseai.jobwiseai_backend.model.User;
import com.jobwiseai.jobwiseai_backend.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
public class CompanyController {

    private final CompanyService companyService;

    // Create a company (store in User fields)
    @PostMapping("/employers/{employerId}/company")
    public ResponseEntity<Map<String, Object>> createCompany(
            @PathVariable UUID employerId,
            @Valid @RequestBody CompanyCreateRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "Unauthorized"));
        }

        try {
            log.info("Creating company for employerId: {}", employerId);
            CompanyCreateRequest company = companyService.createCompany(employerId, request);

            return ResponseEntity.status(201)
                    .body(Map.of(
                            "success", true,
                            "message", "Company created successfully",
                            "data", company
                    ));
        } catch (Exception e) {
            log.error("Error creating company: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Get company info
    @GetMapping("/employers/{employerId}/company")
    public ResponseEntity<Map<String, Object>> getCompanyByEmployer(
            @PathVariable UUID employerId,
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "Unauthorized"));
        }

        try {
            log.info("Fetching company for employerId: {}", employerId);
            CompanyCreateRequest company = companyService.getCompanyByEmployer(employerId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Company retrieved successfully",
                    "data", company
            ));
        } catch (Exception e) {
            log.error("Error fetching company: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Update company info
    @PutMapping("/employers/{employerId}/company")
    public ResponseEntity<Map<String, Object>> updateCompany(
            @PathVariable UUID employerId,
            @Valid @RequestBody CompanyCreateRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "Unauthorized"));
        }

        try {
            log.info("Updating company for employerId: {}", employerId);
            CompanyCreateRequest updatedCompany = companyService.updateCompany(employerId, request);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Company updated successfully",
                    "data", updatedCompany
            ));
        } catch (Exception e) {
            log.error("Error updating company: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
