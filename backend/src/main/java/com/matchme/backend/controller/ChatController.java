package com.matchme.backend.controller;

import com.matchme.backend.dto.ChatResponse;
import com.matchme.backend.dto.MessageResponse;
import com.matchme.backend.dto.SendMessageRequest;
import com.matchme.backend.dto.TypingIndicatorRequest;
import com.matchme.backend.dto.TypingIndicatorResponse;
import com.matchme.backend.model.Chat;
import com.matchme.backend.model.Message;
import com.matchme.backend.model.User;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.service.ChatService;
import com.matchme.backend.service.UserService;
import com.matchme.backend.repo.UserProfileRepository;
import com.matchme.backend.repo.ChatRepository;
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
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<ChatResponse>> getUserChats(@AuthenticationPrincipal String email) {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ChatResponse> chats = chatService.getUserChats(user.getId());
        return ResponseEntity.ok(chats);
    }

    @GetMapping("/with/{otherUserId}")
    public ResponseEntity<ChatResponse> getOrCreateChatWithUser(
        @AuthenticationPrincipal String email,
        @PathVariable Long otherUserId) {
    
        System.out.println("Get/Create chat: " + email + " with user " + otherUserId);
        
        User currentUser = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Chat chat = chatService.getOrCreateChat(currentUser.getId(), otherUserId);
        ChatResponse response = chatService.buildChatResponse(chat, currentUser.getId());
            
        return ResponseEntity.ok(response);
    }

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

    @PostMapping("/{chatId}/read")
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal String email,
            @PathVariable Long chatId) {
        
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        chatService.markMessagesAsRead(chatId, user.getId());
        
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        
        Long otherUserId = chat.getOtherUserId(user.getId());
        
        Map<String, Object> readReceipt = new HashMap<>();
        readReceipt.put("chatId", chatId);
        readReceipt.put("readBy", user.getId());
        
        String destination = "/topic/read-receipts/" + otherUserId;
        messagingTemplate.convertAndSend(destination, (Object) readReceipt);
        
        return ResponseEntity.ok().build();
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
    
        if (principal == null) {
            System.out.println("Principal is null");
            return;
        }
        
        String email = principal.getName();
        User sender = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Message message = chatService.sendMessage(sender.getId(), request.getRecipientId(), request.getContent());

        UserProfile senderProfile = userProfileRepository.findByUserId(sender.getId())
                .orElse(null);

        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setChatId(message.getChatId());
        response.setSenderId(message.getSenderId());
        response.setSenderName(senderProfile != null ? senderProfile.getName() : "Unknown");
        response.setContent(message.getContent());
        response.setCreatedAt(message.getCreatedAt());
        response.setIsRead(false);

        messagingTemplate.convertAndSend("/topic/messages/" + request.getRecipientId(), (Object) response);
        messagingTemplate.convertAndSend("/topic/messages/" + sender.getId(), (Object) response);
        
        System.out.println("Message sent to both users");
    }

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingIndicatorRequest request, Principal principal) {
        String email = principal.getName();
        User sender = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TypingIndicatorResponse response = new TypingIndicatorResponse(
                sender.getId(),
                request.getIsTyping()
        );

        String destination = "/topic/typing/" + request.getRecipientId();
        messagingTemplate.convertAndSend(destination, (Object) response);
    }
}