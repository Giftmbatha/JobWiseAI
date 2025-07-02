package com.jobwiseai.jobwiseai_backend.repository;

import com.jobwiseai.jobwiseai_backend.model.Job;
import com.jobwiseai.jobwiseai_backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job,Long>{

    //Find jobs by employer
    List<Job> findByEmployerOrderByCreatedAtDesc(User employer);

    //Find active jobs by employer
    List<Job>findByEmployerAnIsActiveOrderByCreatedAtDesc(User employer, Boolean isActive);

    //Find jobs by company
    List<Job> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    //Find active jobs
    Page<Job> findByIsActiveOrderByCreatedAtDesc(Boolean isActive, Pageable pageable);

    //Find job by ID and employer (for security)
    Optional<Job> findByIdAndEmployer(Long id, User employer);

    //Search jobs by title or description
    @Query("SELECT j FROM Job j.isActive = true AND " +
            "(LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(j.description) LIKE LOWER(CONCAT('%' :query, '%')))")
    Page<Job> searchJobs(@Param("query") String query, Pageable pageable);

    // Count jobs by employer
    long countByEmployer(User employer);

    //Count active jobs by employer
    long countByEmployerAndIsActive(User employer, Boolean isActive);

}
