package lk.ijse.gdse.service;

import java.util.Map;

public interface AdminDashboardService {
    Map<String, Object> getUserStats();
    Map<String, Object> getPostStats();
    Map<String, Object> getBoostStats();
    Map<String, Object> getCommentStats();
}
