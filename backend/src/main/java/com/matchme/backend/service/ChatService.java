package com.matchme.backend.service;

import com.matchme.backend.dto.ChatResponse;
import com.matchme.backend.dto.MessageResponse;
import com.matchme.backend.model.Chat;
import com.matchme.backend.model.Message;
import com.matchme.backend.model.UserProfile;
import com.matchme.backend.repo.ChatRepository;
import com.matchme.backend.repo.MessageRepository;
import com.matchme.backend.repo.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private MatchService matchService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public List<ChatResponse> getUserChats(Long userId) {
        List<Chat> chats = chatRepository.findAllByUserIdOrderByLastMessageDesc(userId);
        
        return chats.stream()
                .map(chat -> buildChatResponse(chat, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public Chat getOrCreateChat(Long user1Id, Long user2Id) {
        if (!matchService.areUsersMatched(user1Id, user2Id)) {
            throw new IllegalArgumentException("Users must be matched to start a chat");
        }

        return chatRepository.findByUserIds(user1Id, user2Id)
                .orElseGet(() -> {
                    Chat newChat = new Chat();
                    newChat.setUser1Id(user1Id);
                    newChat.setUser2Id(user2Id);
                    newChat.setLastMessageAt(ZonedDateTime.now(ZoneOffset.UTC));
                    newChat.setLastMessage(""); // Initialize empty instead of null
                    newChat.setUnreadCountUser1(0);
                    newChat.setUnreadCountUser2(0);
                    
                    Chat saved = chatRepository.save(newChat);
                    System.out.println("Created new chat ID: " + saved.getId());

                    // Notify both users via WebSocket
                    ChatResponse chatForUser1 = buildChatResponse(saved, user1Id);
                    ChatResponse chatForUser2 = buildChatResponse(saved, user2Id);
                    
                    messagingTemplate.convertAndSend("/topic/chat-created/" + user1Id, chatForUser1);
                    messagingTemplate.convertAndSend("/topic/chat-created/" + user2Id, chatForUser2);
                    
                    return saved;
                });
    }

    @Transactional
    public Message sendMessage(Long senderId, Long recipientId, String content) {
        Chat chat = getOrCreateChat(senderId, recipientId);
        
        Message message = new Message();
        message.setChatId(chat.getId());
        message.setSenderId(senderId);
        message.setContent(content);
        message.setCreatedAt(ZonedDateTime.now(ZoneOffset.UTC));
        message.setIsRead(false);
        
        Message savedMessage = messageRepository.save(message);
        System.out.println("Saved message ID: " + savedMessage.getId() + " to chat " + chat.getId());
        
        // Update chat metadata
        chat.setLastMessage(content);
        chat.setLastMessageAt(ZonedDateTime.now(ZoneOffset.UTC));
        
        // Increment unread count for recipient
        if (chat.getUser1Id().equals(recipientId)) {
            chat.setUnreadCountUser1(chat.getUnreadCountUser1() + 1);
        } else {
            chat.setUnreadCountUser2(chat.getUnreadCountUser2() + 1);
        }
        
        chatRepository.save(chat);
        
        return savedMessage;
    }

    public Page<MessageResponse> getChatMessages(Long chatId, Long userId, int page, int size) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));

        if (!chat.includesUser(userId)) {
            throw new IllegalArgumentException("User not authorized to view this chat");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable);

        return messages.map(this::buildMessageResponse);
    }

    @Transactional
    public void markMessagesAsRead(Long chatId, Long userId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));

        if (!chat.includesUser(userId)) {
            throw new IllegalArgumentException("User not authorized");
        }

        int updatedCount = messageRepository.markMessagesAsRead(chatId, userId);
        System.out.println("Marked " + updatedCount + " messages as read in chat " + chatId);
        
        chat.resetUnreadCountForUser(userId);
        chatRepository.save(chat);
    }

    public ChatResponse buildChatResponse(Chat chat, Long currentUserId) {
        Long otherUserId = chat.getOtherUserId(currentUserId);
        
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

    private MessageResponse buildMessageResponse(Message message) {
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