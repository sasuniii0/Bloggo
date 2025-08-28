package lk.ijse.gdse.service.impl;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class SendGridEmailServiceImpl {

    @Value("${sendgrid.api.key}")
    private String apiKey;

    @Value("${sendgrid.from.email}")
    private static String fromEmail;

    @Value("${sendgrid.from.name}")
    private static String fromName;

    private static SendGrid sendGrid;

    @PostConstruct
    public void init() {
        sendGrid = new SendGrid(apiKey);
    }

    public static void sendPasswordResetEmail(String toEmail, String resetLink) throws IOException {
        Email from = new Email(fromEmail, fromName);
        String subject = "Password Reset Request";
        Email to = new Email(toEmail);
        Content content = new Content("text/html",
                "<p>Hello,</p>" +
                        "<p>Click the link below to reset your password:</p>" +
                        "<a href='" + resetLink + "'>Reset Password</a>" +
                        "<p>If you did not request this, ignore this email.</p>");
        Mail mail = new Mail(from, subject, to, content);

        Request request = new Request();
        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());

        Response response = sendGrid.api(request);

        if (response.getStatusCode() >= 400) {
            throw new RuntimeException("SendGrid error: " + response.getBody());
        }
    }
}
