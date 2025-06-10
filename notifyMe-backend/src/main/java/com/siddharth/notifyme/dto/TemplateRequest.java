package com.siddharth.notifyme.dto;

import lombok.Data;

@Data
public class TemplateRequest {
    private String name;
    private String subject;
    private String body;
}