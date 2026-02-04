package com.matchme.backend.repo;

import com.matchme.backend.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query("SELECT c FROM Chat c WHERE (c.user1Id = :userId OR c.user2Id = :userId) " +
    "ORDER BY c.lastMessageAt DESC")
List<Chat> findAllByUserIdOrderByLastMessageDesc(@Param("userId") Long userId);

@Query("SELECT c FROM Chat c WHERE " +
    "(c.user1Id = :user1Id AND c.user2Id = :user2Id) OR " +
    "(c.user1Id = :user2Id AND c.user2Id = :user1Id)")
Optional<Chat> findByUserIds(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);

@Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Chat c " +
    "WHERE (c.user1Id = :user1Id AND c.user2Id = :user2Id) OR " +
    "(c.user1Id = :user2Id AND c.user2Id = :user1Id)")
boolean existsByUserIds(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);

    

    
}
