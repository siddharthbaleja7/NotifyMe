package com.siddharth.notifyme.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStats {
    private long totalNotifications;
    private long sentNotifications;
    private long failedNotifications;
    private long pendingNotifications;
}