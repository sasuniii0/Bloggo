package lk.ijse.gdse.service.impl;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.ClickTrackingSetting;
import com.sendgrid.helpers.mail.objects.TrackingSettings;
import jakarta.annotation.PostConstruct;
import lk.ijse.gdse.service.SendGridEmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class SendGridEmailServiceImpl implements SendGridEmailService {

    @Value("${sendgrid.api.key}")
    private String apiKey;

    @Value("${sendgrid.from.email}")
    private String fromEmail;

    @Value("${sendgrid.from.name}")
    private String fromName;

    private SendGrid sendGrid;

    @PostConstruct
    public void init() {
        sendGrid = new SendGrid(apiKey);
    }

    /**
     * Sends a password reset email via SendGrid
     *
     * @param toEmail   Recipient email
     * @param resetLink Password reset link
     */
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        Mail mail = createMail(toEmail, resetLink);

        TrackingSettings trackingSettings = new TrackingSettings();
        ClickTrackingSetting clickTracking = new ClickTrackingSetting();
        clickTracking.setEnable(false);
        clickTracking.setEnableText(false);
        trackingSettings.setClickTrackingSetting(clickTracking);
        mail.setTrackingSettings(trackingSettings);

        System.out.println(resetLink);

        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sendGrid.api(request);

            int status = response.getStatusCode();
            System.out.println("SendGrid Status Code: " + status);
            System.out.println("Response Body: " + response.getBody());
            System.out.println("Response Headers: " + response.getHeaders());

            if (status == 403) {
                System.err.println("Email not sent: sender address is not verified. Check SendGrid sender identity.");
            } else if (status >= 400) {
                System.err.println("SendGrid returned an error: " + response.getBody());
            } else {
                System.out.println("Password reset email sent successfully to " + toEmail);
            }



        } catch (IOException ex) {
            System.err.println("Failed to send email: " + ex.getMessage());
        }
    }

    /**
     * Creates a SendGrid Mail object
     */
    private Mail createMail(String toEmail, String resetLink) {
        Email from = new Email(fromEmail, fromName);
        Email to = new Email(toEmail);
        String subject = "Password Reset Request";

        Content content = new Content(
                "text/html",
                "<p>Hello,</p>" +
                        "<p>Click the link below to reset your password:</p>" +
                        "<a href='" + resetLink + "'>Reset Password</a>" +
                        "<p>If you did not request this, ignore this email.</p>"
        );

        return new Mail(from, subject, to, content);
    }

    @Override
    public void sendLoginNotificationEmail(String email, String username) {
        Email from = new Email(fromEmail, fromName);
        Email to = new Email(email);
        String subject = "Login Notification";

        String contentHtml = "<p>Hello " + username + ",</p>" +
                "<p>You have successfully logged in to your account.</p>" +
                "<p>Login time: " + java.time.LocalDateTime.now() + "</p>" +
                "<p>If this wasn’t you, please secure your account immediately.</p>";

        Content content = new Content("text/html", contentHtml);
        Mail mail = new Mail(from, subject, to, content);

        // Disable click tracking
        TrackingSettings trackingSettings = new TrackingSettings();
        ClickTrackingSetting clickTracking = new ClickTrackingSetting();
        clickTracking.setEnable(false);
        clickTracking.setEnableText(false);
        trackingSettings.setClickTrackingSetting(clickTracking);
        mail.setTrackingSettings(trackingSettings);

        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sendGrid.api(request);
            System.out.println("SendGrid Status Code: " + response.getStatusCode());
        } catch (IOException ex) {
            System.err.println("Failed to send login email: " + ex.getMessage());
        }
    }
}
