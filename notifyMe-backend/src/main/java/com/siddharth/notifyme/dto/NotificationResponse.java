package com.siddharth.notifyme.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationResponse {
    private boolean success;
    private Long notificationId;
    private String message;
}
