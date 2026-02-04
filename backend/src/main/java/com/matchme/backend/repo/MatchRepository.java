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
    
    Optional<Match> findByUserIdAndLikedUserId(Long userId, Long likedUserId);
    
    // Get pending connection requests received by user
    @Query("SELECT m FROM Match m WHERE m.likedUserId = :userId AND m.status = 'PENDING'")
    List<Match> findPendingRequestsForUser(@Param("userId") Long userId);
    
    // Get all accepted matches for a user
    @Query("SELECT m FROM Match m WHERE m.userId = :userId AND m.status = 'MATCHED'")
    List<Match> findAllMatchesByUserId(@Param("userId") Long userId);
    
    // Check if users are matched (accepted)
    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Match m " +
           "WHERE ((m.userId = :user1Id AND m.likedUserId = :user2Id) OR " +
           "(m.userId = :user2Id AND m.likedUserId = :user1Id)) " +
           "AND m.status = 'MATCHED'")
    boolean areUsersMatched(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
    
    // Get sent requests
    @Query("SELECT m FROM Match m WHERE m.userId = :userId AND m.status = 'PENDING'")
    List<Match> findSentRequestsByUser(@Param("userId") Long userId);
    
    // Delete all matches between two users (for disconnect)
    @Query("DELETE FROM Match m WHERE (m.userId = :user1Id AND m.likedUserId = :user2Id) OR (m.userId = :user2Id AND m.likedUserId = :user1Id)")
    void deleteAllMatchesBetweenUsers(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
}