package com.jobwiseai.jobwiseai_backend.repository;

import com.jobwiseai.jobwiseai_backend.model.Company;
import com.jobwiseai.jobwiseai_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {

    Optional<Company> findByEmployer(User employer);
    boolean existsByEmployer(User employer);
}
