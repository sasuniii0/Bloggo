package lk.ijse.gdse.repository;

import lk.ijse.gdse.entity.Notification;
import lk.ijse.gdse.entity.Type;
import lk.ijse.gdse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    List<Notification> findByUserUserIdAndIsReadFalse(Long userId);

}
