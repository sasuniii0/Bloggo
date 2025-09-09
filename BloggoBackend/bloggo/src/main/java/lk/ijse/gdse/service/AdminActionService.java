package lk.ijse.gdse.service;

import lk.ijse.gdse.entity.AdminAction;

public interface AdminActionService {


    Object getAllActions();

    AdminAction createAction(String adminUsername, String targetUsername, AdminAction adminAction);


    AdminAction toggleUserStatusWithAction(Long userId, String adminUsername);
}
