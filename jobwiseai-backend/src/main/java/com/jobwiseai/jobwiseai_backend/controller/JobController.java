package com.jobwiseai.jobwiseai_backend.controller;

import com.jobwiseai.jobwiseai_backend.dto.ApiResponse;
import com.jobwiseai.jobwiseai_backend.dto.JobCreateRequest;
import com.jobwiseai.jobwiseai_backend.dto.JobResponse;
import com.jobwiseai.jobwiseai_backend.dto.JobUpdateRequest;
import com.jobwiseai.jobwiseai_backend.model.User;
import com.jobwiseai.jobwiseai_backend.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
@Slf4j
public class JobController {

    private final JobService jobService;

    @PostMapping
    public ResponseEntity<ApiResponse<JobResponse>> createJob(
            @Valid @RequestBody JobCreateRequest request,
            @AuthenticationPrincipal User currentUser) throws BadRequestException {
        log.info("Job creation request received from employer: {} ", currentUser.getEmail());
        log.debug("JobCreateRequest payload: {}", request);
        JobResponse response = jobService.createJob(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Job created successfully", response));
    }

    @GetMapping("/employer")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getEmployerJobs(
            @AuthenticationPrincipal User currentUser){
        log.info("Getting jobs for employer: {}", currentUser.getEmail());
        List<JobResponse> jobs = jobService.getEmployerJobs(currentUser.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Jobs retrieved successfully", jobs));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<ApiResponse<JobResponse>> getJobById( @PathVariable UUID jobId){
        log.info("Getting job by ID: {}", jobId);
        JobResponse job = jobService.getJobById(jobId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Job Retrieved successfully", job));
    }

    @GetMapping("/employer/{jobId}")
    public ResponseEntity<ApiResponse<JobResponse>> getEmployerJobById(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal User currentUser) {
        log.info("Getting job ID: {} for employer: {}", jobId, currentUser.getEmail());
        JobResponse job = jobService.getEmployerJobById(jobId, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Job retrieved successfully", job));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobResponse>>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        log.info("Getting all jobs - page: {}, size: {}", page, size);
        Page<JobResponse> jobs = jobService.getAllJobs(page, size, sortBy, sortDir);
        return ResponseEntity.ok(new ApiResponse<>(true, "Jobs retrieved successfully", jobs));
    }

    @PutMapping("/{jobId}")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(
            @PathVariable UUID jobId,
            @Valid @RequestBody JobUpdateRequest request,
            @AuthenticationPrincipal User currentUser) throws BadRequestException {
        log.info("Job update request for ID: {} from employer: {}", jobId, currentUser.getEmail());
        log.debug("JobUpdateRequest payload: {}", request);
        JobResponse response = jobService.updateJob(jobId, request, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Job updated successfully", response));
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal User currentUser) {
        log.info("Job deletion request for ID: {} from employer: {}", jobId, currentUser.getEmail());
        jobService.deleteJob(jobId, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Job deleted successfully", null));
    }
}
