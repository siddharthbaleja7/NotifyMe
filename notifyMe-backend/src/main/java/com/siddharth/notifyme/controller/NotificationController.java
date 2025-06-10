package com.siddharth.notifyme.controller;

import com.siddharth.notifyme.dto.NotificationRequest;
import com.siddharth.notifyme.dto.NotificationResponse;
import com.siddharth.notifyme.dto.NotificationDTO;
import com.siddharth.notifyme.entity.Notification;
import com.siddharth.notifyme.entity.NotificationStatus;
import com.siddharth.notifyme.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/notify")
    public ResponseEntity<NotificationResponse> sendNotification(
            @RequestBody NotificationRequest request,
            @RequestParam(required = false) String apiKey) {

        if (!"secret-api-key".equals(apiKey)) {
            return ResponseEntity.status(401).body(
                    NotificationResponse.builder()
                            .success(false)
                            .message("Invalid API key")
                            .build()
            );
        }

        try {
            Notification notification = notificationService.sendNotification(request);
            return ResponseEntity.ok(
                    NotificationResponse.builder()
                            .success(true)
                            .notificationId(notification.getId())
                            .message("Notification sent successfully")
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    NotificationResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationDTO>> getNotifications(
            @RequestParam(required = false) String status) {

        if (status != null) {
            NotificationStatus notificationStatus = NotificationStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(notificationService.getNotificationsDTOByStatus(notificationStatus));
        }

        return ResponseEntity.ok(notificationService.getAllNotificationsDTO());
    }

    @GetMapping("/notifications/{id}")
    public ResponseEntity<NotificationDTO> getNotification(@PathVariable Long id) {
        NotificationDTO notification = notificationService.getNotificationDTOById(id);
        if (notification != null) {
            return ResponseEntity.ok(notification);
        }
        return ResponseEntity.notFound().build();
    }
}