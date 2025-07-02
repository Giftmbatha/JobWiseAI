package com.jobwiseai.jobwiseai_backend.repository;

import com.jobwiseai.jobwiseai_backend.model.Company;
import com.jobwiseai.jobwiseai_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByEmployer(User employer);
    Optional<Company> findByEmployerId(Long employerId);

    boolean existsByEmployer(User employer);
}
