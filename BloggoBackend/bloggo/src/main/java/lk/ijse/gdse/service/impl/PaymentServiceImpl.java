package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.entity.Notification;
import lk.ijse.gdse.entity.Payment;
import lk.ijse.gdse.entity.Type;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.repository.NotificationRepository;
import lk.ijse.gdse.repository.PaymentRepository;
import lk.ijse.gdse.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    @Override
    @Transactional
    public Payment savePayment(Payment payment) {
        // 1️⃣ Set creation timestamp
        payment.setCreatedAt(LocalDateTime.now());
        Payment savedPayment = paymentRepository.save(payment);

        // 2️⃣ Send notification to user
        User user = payment.getUser(); // assuming Payment has a `User user` field
        if (user != null) {
            Notification notification = Notification.builder()
                    .user(user)
                    .message("Welcome, " + user.getUsername() + "! Your payment is successful. Congrats on becoming a member!!!")
                    .type(Type.MEMBERSHIP_SUCCESS) // make sure you have a Type enum value for payment
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            notificationRepository.save(notification);
        }

        return savedPayment;
    }



}
