package com.matchme.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {

    private Long chatId;
    private Long otherUserId;
    private String otherUserName;
    private String otherUserProfilePicture;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private Integer unreadCount;
    
}
