package com.siddharth.notifyme.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TemplateDTO {
    private Long id;
    private String name;
    private String subject;
    private String body;
    private LocalDateTime createdAt;
}