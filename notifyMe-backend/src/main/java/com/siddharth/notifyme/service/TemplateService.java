package com.siddharth.notifyme.service;

import com.siddharth.notifyme.dto.TemplateRequest;
import com.siddharth.notifyme.entity.Template;
import com.siddharth.notifyme.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final TemplateRepository templateRepository;

    public List<Template> getAllTemplates() {
        return templateRepository.findAll();
    }

    public Template getTemplateById(Long id) {
        return templateRepository.findById(id).orElse(null);
    }

    public Template getTemplateByName(String name) {
        return templateRepository.findByName(name).orElse(null);
    }

    public Template createTemplate(TemplateRequest request) {
        if (templateRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Template with this name already exists");
        }

        Template template = new Template();
        template.setName(request.getName());
        template.setSubject(request.getSubject());
        template.setBody(request.getBody());

        return templateRepository.save(template);
    }

    public Template updateTemplate(Long id, TemplateRequest request) {
        Template template = templateRepository.findById(id).orElse(null);
        if (template == null) {
            return null;
        }

        if (!template.getName().equals(request.getName()) &&
                templateRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Template with this name already exists");
        }

        template.setName(request.getName());
        template.setSubject(request.getSubject());
        template.setBody(request.getBody());

        return templateRepository.save(template);
    }

    public boolean deleteTemplate(Long id) {
        if (templateRepository.existsById(id)) {
            templateRepository.deleteById(id);
            return true;
        }
        return false;
    }
}