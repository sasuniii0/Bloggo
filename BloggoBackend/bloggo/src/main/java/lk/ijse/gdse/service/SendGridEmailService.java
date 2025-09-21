package lk.ijse.gdse.service;

public interface SendGridEmailService {
    void sendLoginNotificationEmail(String email, String username);
}
