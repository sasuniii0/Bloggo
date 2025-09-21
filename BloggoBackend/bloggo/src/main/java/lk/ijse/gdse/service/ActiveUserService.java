package lk.ijse.gdse.service;

import java.util.Set;

public interface ActiveUserService {
    public void userConnected(Long userId);

    public void userDisconnected(Long userId);

    public boolean isOnline(Long userId) ;

    public Set<Long> getOnlineUsers();
}
