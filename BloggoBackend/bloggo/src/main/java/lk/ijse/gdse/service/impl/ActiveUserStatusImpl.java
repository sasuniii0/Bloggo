package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.service.ActiveUserService;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Service
public class ActiveUserStatusImpl implements ActiveUserService {

    private final Set<Long> onlineUsers = Collections.synchronizedSet(new HashSet<>());

    @Override
    public void userConnected(Long userId) {
        onlineUsers.add(userId);
    }

    @Override
    public void userDisconnected(Long userId) {
        onlineUsers.remove(userId);
    }

    @Override
    public boolean isOnline(Long userId) {
        return onlineUsers.contains(userId);
    }

    @Override
    public Set<Long> getOnlineUsers() {
        return onlineUsers;
    }
}
