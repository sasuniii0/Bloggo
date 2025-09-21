package lk.ijse.gdse.dto;

import lk.ijse.gdse.entity.ActionStatus;

public record UserStatus(Long userId, String username, ActionStatus status) {
}
