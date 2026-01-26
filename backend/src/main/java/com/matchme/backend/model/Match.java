package com.matchme.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "matches", 
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "liked_user_id"}),
    indexes = {
        @Index(name = "idx_user_liked", columnList = "user_id, liked_user_id"),
        @Index(name = "idx_mutual_match", columnList = "user_id, liked_user_id, status")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "liked_user_id", nullable = false)
    private Long likedUserId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status = MatchStatus.PENDING;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime matchedAt;
    
    public enum MatchStatus {
        PENDING,    // Request sent, waiting for response
        MATCHED,   // Mutual match
        DECLINED    // Request declined
    }
    
    // Helper method for backward compatibility if needed
    public Boolean getIsMatch() {
        return status == MatchStatus.MATCHED;
    }
}