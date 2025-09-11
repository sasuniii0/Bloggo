package lk.ijse.gdse.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lk.ijse.gdse.dto.NotificationDTO;
import lk.ijse.gdse.entity.Notification;
import lk.ijse.gdse.entity.Type;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.repository.NotificationRepository;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    @Override
    public Notification createNotification(Long userId, String message, Type type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        return notificationRepository.save(notification);
    }

    @Override
    public List<NotificationDTO> getUserNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return notifications.stream().map(notification -> new NotificationDTO(
                notification.getNotificationId(),
                notification.getMessage(),
                notification.getType(),
                notification.getIsRead(),
                notification.getUser().getUserId(),
                notification.getCreatedAt()
        )).toList();
    }

    @Override
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found with ID: " + id));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        List<Notification> unread = notificationRepository.findByUserUserIdAndIsReadFalse(userId);
        return unread.stream().map(notification -> new NotificationDTO(
                notification.getNotificationId(),
                notification.getMessage(),
                notification.getType(),
                notification.getIsRead(),
                notification.getUser().getUserId(),
                notification.getCreatedAt()
        )).toList();
    }


}
