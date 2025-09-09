package lk.ijse.gdse.service;

import lk.ijse.gdse.entity.AdminAction;

public interface AdminActionService {
    AdminAction updateActionStatus(Long id, String status);

    Object getAllActions();

    AdminAction createAction(String adminUsername, String targetUsername, AdminAction adminAction);
}
