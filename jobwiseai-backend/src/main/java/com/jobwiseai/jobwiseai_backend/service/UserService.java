package com.jobwiseai.jobwiseai_backend.service;

import com.jobwiseai.jobwiseai_backend.model.User;
import com.jobwiseai.jobwiseai_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    // New methods for company profile management (as per previous context)
    public Optional<User> updateCompanyProfile(UUID employerId, User updatedUser) {
        return userRepository.findById(employerId).map(user -> {
            user.setCompanyName(updatedUser.getCompanyName());
            user.setCompanyDescription(updatedUser.getCompanyDescription());
            user.setCompanyWebsite(updatedUser.getCompanyWebsite());
            user.setCompanyIndustry(updatedUser.getCompanyIndustry());
            user.setCompanySize(updatedUser.getCompanySize());
            user.setCompanyLocation(updatedUser.getCompanyLocation());
            user.setCompanyFoundedYear(updatedUser.getCompanyFoundedYear());
            user.setCompanyLogo(updatedUser.getCompanyLogo());
            return userRepository.save(user);
        });
    }

    public Optional<User> getCompanyProfile(UUID employerId) {
        return userRepository.findById(employerId)
                .filter(user -> user.getUserType() == User.UserType.EMPLOYER);
    }
}
