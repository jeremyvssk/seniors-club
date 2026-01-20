package com.matchme.backend.repo;

import com.matchme.backend.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

     // Check if user already liked another user
     Optional<Match> findByUserIdAndLikedUserId(Long userId, Long likedUserId);
    
     // Check if mutual match exists
     @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Match m " +
            "WHERE ((m.userId = :user1Id AND m.likedUserId = :user2Id) OR " +
            "(m.userId = :user2Id AND m.likedUserId = :user1Id)) " +
            "AND m.isMatch = true")
     boolean existsByUser1IdAndUser2IdAndIsMatch(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id, Boolean isMatch);
     
     // Get all matches for a user
     @Query("SELECT m FROM Match m WHERE m.userId = :userId AND m.isMatch = true")
     List<Match> findAllMatchesByUserId(@Param("userId") Long userId);
     
     // Get all users who liked the current user (pending likes)
     @Query("SELECT m FROM Match m WHERE m.likedUserId = :userId AND m.isMatch = false")
     List<Match> findPendingLikesForUser(@Param("userId") Long userId);
}
