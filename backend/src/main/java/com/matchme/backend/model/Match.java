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
        @Index(name = "idx_mutual_match", columnList = "user_id, liked_user_id, is_match")
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
    
    @Column(nullable = false)
    private Boolean isMatch = false; // true if mutual like
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime matchedAt; // When mutual match occurred
    
}
