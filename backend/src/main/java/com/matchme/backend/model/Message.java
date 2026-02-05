package com.matchme.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;  

@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_chat_created", columnList = "chatId, createdAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Message {

     
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long chatId;
    
    @Column(nullable = false)
    private Long senderId;
    
    @Column(nullable = false, length = 2000)
    private String content;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private ZonedDateTime createdAt;
    
    @Column(nullable = false)
    private Boolean isRead = false;
    
}
