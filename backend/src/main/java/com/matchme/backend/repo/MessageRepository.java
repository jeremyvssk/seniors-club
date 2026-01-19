package com.matchme.backend.repo;

import com.matchme.backend.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByChatIdOrderByCreatedAtDesc(Long chatId, Pageable pageable);
    
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.chatId = :chatId " +
           "AND m.senderId != :userId AND m.isRead = false")
    int markMessagesAsRead(@Param("chatId") Long chatId, @Param("userId") Long userId);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.chatId = :chatId " +
           "AND m.senderId != :userId AND m.isRead = false")
    long countUnreadMessages(@Param("chatId") Long chatId, @Param("userId") Long userId);
    
}
