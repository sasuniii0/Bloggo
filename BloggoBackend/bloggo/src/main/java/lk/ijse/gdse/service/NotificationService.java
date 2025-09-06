package lk.ijse.gdse.service;

import lk.ijse.gdse.entity.Notification;
import lk.ijse.gdse.entity.Type;

import java.util.List;

public interface NotificationService {
    Notification createNotification(Long userId, String message, Type type);

    List<Notification> getUserNotifications(Long userId);

    void markAsRead(Long id);
}
