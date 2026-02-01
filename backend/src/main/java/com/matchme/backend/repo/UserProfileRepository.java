//talks to the database, saves, finds etc. 


package com.matchme.backend.repo;

import com.matchme.backend.model.UserProfile;
import com.matchme.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUser(User user);
    Optional<UserProfile> findByUserId(Long userId);

    // Custom query to fetch only completed profiles, excluding specific user IDs
    @Query("SELECT p FROM UserProfile p WHERE p.profileCompleted = true " +
           "AND p.user.id != :currentUserId " +
           "AND p.user.id NOT IN :excludedUserIds")
    List<UserProfile> findCandidateProfiles(
        @Param("currentUserId") Long currentUserId,
        @Param("excludedUserIds") List<Long> excludedUserIds
    );
}
