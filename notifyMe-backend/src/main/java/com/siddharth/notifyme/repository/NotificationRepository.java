package com.siddharth.notifyme.repository;

import com.siddharth.notifyme.entity.Notification;
import com.siddharth.notifyme.entity.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByStatus(NotificationStatus status);

    List<Notification> findAllByOrderByCreatedAtDesc();
    List<Notification> findByStatusOrderByCreatedAtDesc(NotificationStatus notificationStatus);
    long countByStatus(NotificationStatus notificationStatus);
}
