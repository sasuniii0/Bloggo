package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.UserStatus;
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
    public List<UserStatus> updateStatus(Long userId) {
        activeUserService.userConnected(userId);

        User user = userRepository.findById(userId).orElseThrow();
        user.setActive(ActionStatus.ONLINE);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return userRepository.findAll().stream()
                .map(u -> new UserStatus(u.getUserId(), u.getUsername(), u.getActive()))
                .toList();
    }
}
