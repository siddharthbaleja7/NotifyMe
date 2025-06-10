package com.siddharth.notifyme.dto;

import lombok.Data;
import java.util.Map;

@Data
public class NotificationRequest {
    private String recipient;
    private Long templateId;
    private Map<String, Object> variables;
}