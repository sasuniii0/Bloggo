package lk.ijse.gdse.service.impl;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import jakarta.transaction.Transactional;
import lk.ijse.gdse.dto.BroadcastDTO;
import lk.ijse.gdse.entity.BroadcastMessage;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.repository.BroadCastRepository;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.service.BroadcastService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BroadcastServiceImpl implements BroadcastService {
    private final BroadCastRepository broadCastRepository;
    private final UserRepository userRepository;

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    @Value("${sendgrid.from.email}")
    private String fromEmail;

    @Value("${sendgrid.from.name}")
    private String fromName;

    @Override
    @Transactional
    public void sendBroadcast(BroadcastDTO dto) throws IOException {
        // Save to DB
        BroadcastMessage message = new BroadcastMessage();
        message.setTitle(dto.getTitle());
        message.setContent(dto.getContent());
        message.setCreatedAt(LocalDateTime.now());
        broadCastRepository.save(message);

        // Send email to all users
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                sendEmail(user.getEmail(), message.getTitle(), message.getContent());
            }
        }
    }

    private void sendEmail(String toEmail, String subject, String body) throws IOException {
        Email from = new Email(fromEmail, fromName);
        Email to = new Email(toEmail);
        Content content = new Content("text/html", body);
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());
        sg.api(request);
    }
}
