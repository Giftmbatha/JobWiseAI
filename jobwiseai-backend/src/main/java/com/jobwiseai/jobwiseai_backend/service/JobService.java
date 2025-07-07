package com.jobwiseai.jobwiseai_backend.service;

import com.jobwiseai.jobwiseai_backend.dto.*;
import com.jobwiseai.jobwiseai_backend.exception.*;
import com.jobwiseai.jobwiseai_backend.model.*;
import com.jobwiseai.jobwiseai_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Transactional
    public JobResponse createJob(JobCreateRequest request, UUID employerId) throws BadRequestException {
        log.info("Creating job for employer ID: {}", employerId);

        // Get employer
        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));

        // Validate employer type
        if (employer.getUserType() != User.UserType.EMPLOYER) {
            throw new UnauthorizedException("Only employers can create jobs");
        }

        // Get or create company
        Company company = companyRepository.findByEmployer(employer)
                .orElseThrow(() -> new BadRequestException("Please create a company profile first"));

        // Validate enums
        Job.JobType jobType;
        Job.ExperienceLevel experienceLevel;

        try {
            jobType = Job.JobType.valueOf(request.getJobType().toUpperCase());
            experienceLevel = Job.ExperienceLevel.valueOf(request.getExperienceLevel().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid job type or experience level");
        }

        // Create job
        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .responsibilities(request.getResponsibilities())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .location(request.getLocation())
                .jobType(jobType)
                .experienceLevel(experienceLevel)
                .skills(request.getSkills())
                .benefits(request.getBenefits())
                .company(company)
                .employer(employer)
                .applicationDeadline(request.getApplicationDeadline())
                .isActive(true)
                .applicationsCount(0)
                .viewsCount(0)
                .build();

        job = jobRepository.save(job);
        log.info("Job created successfully with ID: {}", job.getId());

        return mapToJobResponse(job);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getEmployerJobs(UUID employerId) {
        log.info("Getting jobs for employer ID: {}", employerId);

        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));

        List<Job> jobs = jobRepository.findByEmployerOrderByCreatedAtDesc(employer);

        return jobs.stream()
                .map(this::mapToJobResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobResponse getJobById(UUID   jobId) {
        log.info("Getting job by ID: {}", jobId);

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        // Increment view count
        job.incrementViewsCount();
        jobRepository.save(job);

        return mapToJobResponse(job);
    }

    @Transactional(readOnly = true)
    public JobResponse getEmployerJobById(UUID jobId, UUID employerId) {
        log.info("Getting job ID: {} for employer ID: {}", jobId, employerId);

        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));

        Job job = jobRepository.findByIdAndEmployer(jobId, employer)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found or access denied"));

        return mapToJobResponse(job);
    }

    @Transactional(readOnly = true)
    public Page<JobResponse> getAllJobs(int page, int size, String sortBy, String sortDir) {
        log.info("Getting all active jobs - page: {}, size: {}", page, size);

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Job> jobs = jobRepository.findByIsActiveOrderByCreatedAtDesc(true, pageable);

        return jobs.map(this::mapToJobResponse);
    }

    @Transactional
    public JobResponse updateJob(UUID jobId, JobCreateRequest request, UUID employerId) throws BadRequestException {
        log.info("Updating job ID: {} for employer ID: {}", jobId, employerId);

        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));

        Job job = jobRepository.findByIdAndEmployer(jobId, employer)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found or access denied"));

        // Validate enums
        Job.JobType jobType;
        Job.ExperienceLevel experienceLevel;

        try {
            jobType = Job.JobType.valueOf(request.getJobType().toUpperCase());
            experienceLevel = Job.ExperienceLevel.valueOf(request.getExperienceLevel().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid job type or experience level");
        }

        // Update job fields
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setResponsibilities(request.getResponsibilities());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setLocation(request.getLocation());
        job.setJobType(jobType);
        job.setExperienceLevel(experienceLevel);
        job.setSkills(request.getSkills());
        job.setBenefits(request.getBenefits());
        job.setApplicationDeadline(request.getApplicationDeadline());

        job = jobRepository.save(job);
        log.info("Job updated successfully: {}", job.getId());

        return mapToJobResponse(job);
    }

    @Transactional
    public void deleteJob(UUID jobId, UUID employerId) {
        log.info("Deleting job ID: {} for employer ID: {}", jobId, employerId);

        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));

        Job job = jobRepository.findByIdAndEmployer(jobId, employer)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found or access denied"));

        // Soft delete - set as inactive
        job.setIsActive(false);
        jobRepository.save(job);

        log.info("Job soft deleted successfully: {}", job.getId());
    }

    private JobResponse mapToJobResponse(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .responsibilities(job.getResponsibilities())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .location(job.getLocation())
                .jobType(job.getJobType().name())
                .experienceLevel(job.getExperienceLevel().name())
                .skills(job.getSkills())
                .benefits(job.getBenefits())
                .company(mapToCompanyDto(job.getCompany()))
                .employerId(job.getEmployer().getId())
                .isActive(job.getIsActive())
                .applicationDeadline(job.getApplicationDeadline())
                .applicationsCount(job.getApplicationsCount())
                .viewsCount(job.getViewsCount())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }

    private JobResponse.CompanyDto mapToCompanyDto(Company company) {
        return JobResponse.CompanyDto.builder()
                .id(company.getId())
                .name(company.getName())
                .description(company.getDescription())
                .website(company.getWebsite())
                .logo(company.getLogo())
                .industry(company.getIndustry())
                .size(company.getSize())
                .location(company.getLocation())
                .foundedYear(company.getFoundedYear())
                .build();
    }
}
