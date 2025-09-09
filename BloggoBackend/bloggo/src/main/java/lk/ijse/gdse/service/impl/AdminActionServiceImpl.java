package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.entity.ActionType;
import lk.ijse.gdse.entity.AdminAction;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.repository.AdminActionRepository;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.service.AdminActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminActionServiceImpl implements AdminActionService {
    private final AdminActionRepository adminActionRepository;
    private final UserRepository userRepository;

    @Override
    public AdminAction updateActionStatus(Long id, String status) {
        AdminAction adminAction = adminActionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AdminAction not found"));

        ActionType curruntStatus = adminAction.getActionType();

        if (curruntStatus == ActionType.ACTIVE) {
            adminAction.setActionType(ActionType.INACTIVE);
        }
        return adminActionRepository.save(adminAction);
    }

    @Override
    public Object getAllActions() {
        return adminActionRepository.findAll();
    }

    @Override
    public AdminAction createAction(String adminUsername, String targetUsername, AdminAction adminAction) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        User targetUser = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        adminAction.setAdmin(admin);
        adminAction.setTargetUser(targetUser);
        adminAction.setActionType(ActionType.ACTIVE);
        adminAction.setCreatedAt(LocalDateTime.now());
        return adminActionRepository.save(adminAction);
    }
}
