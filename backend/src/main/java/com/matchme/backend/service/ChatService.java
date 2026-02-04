package com.matchme.backend.service;

import com.matchme.backend.dto.ChatResponse;
import com.matchme.backend.dto.MessageResponse;
import com.matchme.backend.model.Chat;
import com.matchme.backend.model.Message;
import com.matchme.backend.model.User;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.repo.ChatRepository;
import com.matchme.backend.repo.MessageRepository;
import com.matchme.backend.repo.UserProfileRepository;
import com.matchme.backend.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private MatchService matchService;

    // Get all chats for a user (ordered by most recent)
    public List<ChatResponse> getUserChats(Long userId) {
        List<Chat> chats = chatRepository.findAllByUserIdOrderByLastMessageDesc(userId);
        
        return chats.stream()
                .map(chat -> buildChatResponse(chat, userId))
                .collect(Collectors.toList());
    }

    // Get or create chat between two users
    @Transactional
    public Chat getOrCreateChat(Long user1Id, Long user2Id) {
        // Check if users are matched
        if (!matchService.areUsersMatched(user1Id, user2Id)) {
            throw new IllegalArgumentException("Users must be matched to start a chat");
        }

        return chatRepository.findByUserIds(user1Id, user2Id)
                .orElseGet(() -> {
                    Chat newChat = new Chat();
                    newChat.setUser1Id(user1Id);
                    newChat.setUser2Id(user2Id);
                    newChat.setLastMessageAt(LocalDateTime.now());
                    return chatRepository.save(newChat);
                });
    }

    // Send a message
    @Transactional
    public Message sendMessage(Long senderId, Long recipientId, String content) {
    // Get or create chat
    Chat chat = getOrCreateChat(senderId, recipientId);
    
    // Create and save message
    Message message = new Message();
    message.setChatId(chat.getId());
    message.setSenderId(senderId);
    message.setContent(content);
    message.setCreatedAt(LocalDateTime.now());
    message.setIsRead(false);
    
    Message savedMessage = messageRepository.save(message);
    
    System.out.println("💾 Saved message with senderId: " + savedMessage.getSenderId());
    
    chat.setLastMessage(content);
    chat.setLastMessageAt(LocalDateTime.now());
    
    // Update unread count for the recipient
    if (chat.getUser1Id().equals(recipientId)) {
        chat.setUnreadCountUser1(chat.getUnreadCountUser1() + 1);
    } else {
        chat.setUnreadCountUser2(chat.getUnreadCountUser2() + 1);
    }
    
    chatRepository.save(chat);
    System.out.println("✅ Updated chat with last message");
    
    return savedMessage;
}

    // Get paginated messages for a chat
    public Page<MessageResponse> getChatMessages(Long chatId, Long userId, int page, int size) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));

        // Verify user is part of chat
        if (!chat.includesUser(userId)) {
            throw new IllegalArgumentException("User not authorized to view this chat");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable);

        return messages.map(this::buildMessageResponse);
    }

    // Mark messages as read
    @Transactional
    public void markMessagesAsRead(Long chatId, Long userId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));

        if (!chat.includesUser(userId)) {
            throw new IllegalArgumentException("User not authorized");
        }

        messageRepository.markMessagesAsRead(chatId, userId);
        chat.resetUnreadCountForUser(userId);
        chatRepository.save(chat);
    }

    // Helper method to build ChatResponse
    public ChatResponse buildChatResponse(Chat chat, Long currentUserId) {
        Long otherUserId = chat.getOtherUserId(currentUserId);
        
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfile otherProfile = userProfileRepository.findByUserId(otherUserId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        ChatResponse response = new ChatResponse();
        response.setChatId(chat.getId());
        response.setOtherUserId(otherUserId);
        response.setOtherUserName(otherProfile.getName());
        response.setOtherUserProfilePicture(otherProfile.getProfilePictureUrl());
        response.setLastMessage(chat.getLastMessage());
        response.setLastMessageAt(chat.getLastMessageAt());
        response.setUnreadCount(chat.getUnreadCountForUser(currentUserId));

        return response;
    }

    // Helper method to build MessageResponse
    private MessageResponse buildMessageResponse(Message message) {
        User sender = userRepository.findById(message.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        UserProfile senderProfile = userProfileRepository.findByUserId(message.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender profile not found"));

        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setChatId(message.getChatId());
        response.setSenderId(message.getSenderId());
        response.setSenderName(senderProfile.getName());
        response.setContent(message.getContent());
        response.setCreatedAt(message.getCreatedAt());
        response.setIsRead(message.getIsRead());

        return response;
    }
    
}
