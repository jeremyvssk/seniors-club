//talks to the database, saves, finds etc. 
// doesnt really save right now, only finds :D 

package com.matchme.backend.repo;

import com.matchme.backend.model.UserProfile;
import com.matchme.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUser(User user);
}
