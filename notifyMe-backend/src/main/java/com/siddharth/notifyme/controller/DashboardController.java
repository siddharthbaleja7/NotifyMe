package com.siddharth.notifyme.controller;

import com.siddharth.notifyme.dto.DashboardStats;
import com.siddharth.notifyme.entity.NotificationStatus;
import com.siddharth.notifyme.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final NotificationService notificationService;

    @GetMapping("/stats")
    public DashboardStats getDashboardStats() {
        return DashboardStats.builder()
                .totalNotifications(notificationService.getTotalNotifications())
                .sentNotifications(notificationService.getNotificationCountByStatus(NotificationStatus.SENT))
                .failedNotifications(notificationService.getNotificationCountByStatus(NotificationStatus.FAILED))
                .pendingNotifications(notificationService.getNotificationCountByStatus(NotificationStatus.PENDING))
                .build();
    }
}