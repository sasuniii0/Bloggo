package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.UserStatus;
import lk.ijse.gdse.dto.UserStatusUpdate;
import lk.ijse.gdse.entity.ActionStatus;
import lk.ijse.gdse.entity.ActionType;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.service.ActiveUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class WebSocketController {
    private final ActiveUserService activeUserService;
    private final UserRepository userRepository;

    @MessageMapping("/status")
    @SendTo("/topic/status")
    public UserStatus updateStatus(UserStatusUpdate update) {
        Long userId = update.getUserId();
        String statusStr = update.getStatus();

        // Update active user in service
        activeUserService.userConnected(userId);

        // Update user entity
        User user = userRepository.findById(userId).orElseThrow();

        if ("ONLINE".equals(statusStr)) {
            user.setActive(ActionStatus.ONLINE);
        } else if ("OFFLINE".equals(statusStr)) {
            user.setActive(ActionStatus.OFFLINE);
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Return only the updated user
        return new UserStatus(user.getUserId(), user.getUsername(), user.getActive());
    }

}
