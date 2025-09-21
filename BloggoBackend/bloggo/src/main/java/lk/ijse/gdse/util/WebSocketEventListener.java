package lk.ijse.gdse.util;

import lk.ijse.gdse.entity.ActionStatus;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.service.ActiveUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {
    private final ActiveUserService activeUserService;
    private final UserRepository userRepository;

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        Long userId = Long.valueOf(event.getUser().getName()); // or get from sessionAttributes
        if (userId != null) {
            activeUserService.userDisconnected(userId);

            User user = userRepository.findById(userId).orElseThrow();
            user.setActive(ActionStatus.OFFLINE);
            userRepository.save(user);
        }
    }
}
