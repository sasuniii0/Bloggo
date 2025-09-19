package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.entity.ActionType;
import lk.ijse.gdse.entity.AdminAction;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.exception.AdminNotFoundException;
import lk.ijse.gdse.exception.UserNotFoundException;
import lk.ijse.gdse.repository.AdminActionRepository;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.service.AdminActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminActionServiceImpl implements AdminActionService {
    private final AdminActionRepository adminActionRepository;
    private final UserRepository userRepository;


    @Override
    public Object getAllActions() {
        return adminActionRepository.findAll();
    }

    @Override
    public AdminAction createAction(String adminUsername, String targetUsername, AdminAction adminAction) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new AdminNotFoundException("Admin user not found"));
        User targetUser = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new UserNotFoundException("Target user not found"));

        adminAction.setAdmin(admin);
        adminAction.setTargetUser(targetUser);
        adminAction.setActionType(ActionType.ACTIVE);
        adminAction.setCreatedAt(LocalDateTime.now());
        return adminActionRepository.save(adminAction);
    }

    @Transactional
    public AdminAction toggleUserStatusWithAction(Long userId, String adminUsername) {
        int updatedRows = userRepository.toggleUserStatus(userId);
        if (updatedRows == 0) throw new UserNotFoundException("User not found or no status changed");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new AdminNotFoundException("Admin not found"));

        AdminAction lastAction = adminActionRepository
                .findTopByTargetUser_UserIdOrderByCreatedAtDesc(user.getUserId())
                .orElse(null);

        ActionType newActionType = (lastAction == null || lastAction.getActionType() == ActionType.INACTIVE)
                ? ActionType.ACTIVE
                : ActionType.INACTIVE;

        AdminAction action = AdminAction.builder()
                .targetUser(user)
                .admin(admin)
                .actionType(newActionType)
                .reason("Status toggled by admin")
                .createdAt(LocalDateTime.now())
                .build();

        return adminActionRepository.save(action);
    }
}
