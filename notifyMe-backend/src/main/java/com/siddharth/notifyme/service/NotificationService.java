package com.siddharth.notifyme.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.siddharth.notifyme.dto.NotificationRequest;
import com.siddharth.notifyme.dto.NotificationDTO;
import com.siddharth.notifyme.dto.TemplateDTO;
import com.siddharth.notifyme.entity.Notification;
import com.siddharth.notifyme.entity.NotificationStatus;
import com.siddharth.notifyme.entity.Template;
import com.siddharth.notifyme.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final TemplateService templateService;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    @Transactional
    public Notification sendNotification(NotificationRequest request) {
        if (!isValidEmail(request.getRecipient())) {
            throw new IllegalArgumentException("Invalid email address");
        }

        Template template = templateService.getTemplateById(request.getTemplateId());
        if (template == null) {
            throw new IllegalArgumentException("Template not found");
        }

        Notification notification = new Notification();
        notification.setRecipient(request.getRecipient());
        notification.setTemplate(template);

        try {
            notification.setVariables(objectMapper.writeValueAsString(request.getVariables()));
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid variables format");
        }

        notification.setStatus(NotificationStatus.PENDING);
        notification = notificationRepository.save(notification);

        String processedSubject = processTemplate(template.getSubject(), request.getVariables());
        String processedBody = processTemplate(template.getBody(), request.getVariables());

        // Send email
        try {
            emailService.sendEmail(request.getRecipient(), processedSubject, processedBody);
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            log.info("Email sent successfully to: {}", request.getRecipient());
        } catch (Exception e) {
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
            log.error("Failed to send email to: {}", request.getRecipient(), e);
        }

        return notificationRepository.save(notification);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Notification> getNotificationsByStatus(NotificationStatus status) {
        return notificationRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id).orElse(null);
    }

    public List<NotificationDTO> getAllNotificationsDTO() {
        List<Notification> notifications = notificationRepository.findAllByOrderByCreatedAtDesc();
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getNotificationsDTOByStatus(NotificationStatus status) {
        List<Notification> notifications = notificationRepository.findByStatusOrderByCreatedAtDesc(status);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NotificationDTO getNotificationDTOById(Long id) {
        Notification notification = notificationRepository.findById(id).orElse(null);
        return notification != null ? convertToDTO(notification) : null;
    }

    private NotificationDTO convertToDTO(Notification notification) {
        Template template = notification.getTemplate();

        TemplateDTO templateDTO = TemplateDTO.builder()
                .id(template.getId())
                .name(template.getName())
                .subject(template.getSubject())
                .body(template.getBody())
                .createdAt(template.getCreatedAt())
                .build();

        return NotificationDTO.builder()
                .id(notification.getId())
                .recipient(notification.getRecipient())
                .template(templateDTO)
                .variables(notification.getVariables())
                .status(notification.getStatus())
                .errorMessage(notification.getErrorMessage())
                .createdAt(notification.getCreatedAt())
                .sentAt(notification.getSentAt())
                .build();
    }

    public long getTotalNotifications() {
        return notificationRepository.count();
    }

    public long getNotificationCountByStatus(NotificationStatus status) {
        return notificationRepository.countByStatus(status);
    }

    private String processTemplate(String template, Map<String, Object> variables) {
        if (template == null || variables == null) {
            return template;
        }

        String result = template;
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String value = entry.getValue() != null ? entry.getValue().toString() : "";
            result = result.replace(placeholder, value);
        }
        return result;
    }

    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
}