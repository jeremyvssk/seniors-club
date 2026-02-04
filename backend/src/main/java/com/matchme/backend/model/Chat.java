package com.matchme.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chats")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Chat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long user1Id;
    
    @Column(nullable = false)
    private Long user2Id;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime lastMessageAt;
    
    @Column(length = 1000)
    private String lastMessage;
    
    // Track unread counts for each user
    @Column(nullable = false)
    private Integer unreadCountUser1 = 0;
    
    @Column(nullable = false)
    private Integer unreadCountUser2 = 0;
    
    // Helper method to check if user is part of chat
    public boolean includesUser(Long userId) {
        return user1Id.equals(userId) || user2Id.equals(userId);
    }
    
    // Get the other user's ID
    public Long getOtherUserId(Long userId) {
        return user1Id.equals(userId) ? user2Id : user1Id;
    }
    
    // Get unread count for specific user
    public Integer getUnreadCountForUser(Long userId) {
        return user1Id.equals(userId) ? unreadCountUser1 : unreadCountUser2;
    }
    
    // Reset unread count for specific user
    public void resetUnreadCountForUser(Long userId) {
        if (user1Id.equals(userId)) {
            unreadCountUser1 = 0;
        } else {
            unreadCountUser2 = 0;
        }
    }

     // Increment unread count for specific user
     public void incrementUnreadCountForUser(Long userId) {
        if (user1Id.equals(userId)) {
            unreadCountUser1++;
        } else {
            unreadCountUser2++;
        }
    }
}
