package com.siddharth.notifyme.dto;

import com.siddharth.notifyme.entity.NotificationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDTO {
    private Long id;
    private String recipient;
    private TemplateDTO template;
    private String variables;
    private NotificationStatus status;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
}