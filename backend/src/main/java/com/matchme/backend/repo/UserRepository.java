package com.matchme.backend.repo;

import com.matchme.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Spring Data JPA automatically implements this!
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
}