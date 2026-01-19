package com.matchme.backend.controller;

import com.matchme.backend.dto.ChatResponse;
import com.matchme.backend.dto.MessageResponse;
import com.matchme.backend.dto.SendMessageRequest;
import com.matchme.backend.model.Message;
import com.matchme.backend.model.User;
import com.matchme.backend.service.ChatService;
import com.matchme.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserService userService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Get all chats for current user
    @GetMapping
    public ResponseEntity<List<ChatResponse>> getUserChats(@AuthenticationPrincipal String email) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ChatResponse> chats = chatService.getUserChats(user.getId());
        return ResponseEntity.ok(chats);
    }

    // Get messages for a specific chat (paginated)
    @GetMapping("/{chatId}/messages")
    public ResponseEntity<Page<MessageResponse>> getChatMessages(
            @AuthenticationPrincipal String email,
            @PathVariable Long chatId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Page<MessageResponse> messages = chatService.getChatMessages(chatId, user.getId(), page, size);
        return ResponseEntity.ok(messages);
    }

    // Mark messages as read
    @PostMapping("/{chatId}/read")
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal String email,
            @PathVariable Long chatId) {
        
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        chatService.markMessagesAsRead(chatId, user.getId());
        return ResponseEntity.ok().build();
    }

    // WebSocket: Send message
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
        String email = principal.getName();
        User sender = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Save message to database
        Message message = chatService.sendMessage(sender.getId(), request.getRecipientId(), request.getContent());

        // Build response
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setChatId(message.getChatId());
        response.setSenderId(message.getSenderId());
        response.setContent(message.getContent());
        response.setCreatedAt(message.getCreatedAt());
        response.setIsRead(false);

        // Send to recipient via WebSocket
        messagingTemplate.convertAndSendToUser(
                request.getRecipientId().toString(),
                "/queue/messages",
                response
        );

        // Also send back to sender for confirmation
        messagingTemplate.convertAndSendToUser(
                sender.getId().toString(),
                "/queue/messages",
                response
        );
    }
}
