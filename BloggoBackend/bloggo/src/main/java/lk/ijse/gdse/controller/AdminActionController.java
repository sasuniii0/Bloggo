package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.entity.AdminAction;
import lk.ijse.gdse.service.AdminActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin-actions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342",
        allowCredentials = "true")
public class AdminActionController {
    private final AdminActionService adminActionService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponseDTO> createAction(
            @RequestParam String adminUsername,
            @RequestParam String targetUsername,
            @RequestBody AdminAction adminAction) {
        AdminAction createdAction = adminActionService.createAction(adminUsername, targetUsername, adminAction);
        ApiResponseDTO response = new ApiResponseDTO(
                200,
                "Admin action created successfully",
                createdAction);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getAll")
    public ResponseEntity<ApiResponseDTO> getAllActions() {
        ApiResponseDTO response = new ApiResponseDTO(
                200,
                "Fetched all admin actions successfully",
                adminActionService.getAllActions());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/status/{userId}")
    public ResponseEntity<ApiResponseDTO> toggleStatus(@PathVariable Long userId,
                                                       @RequestParam String adminUsername) {
        try {
            AdminAction updatedAction = adminActionService.toggleUserStatusWithAction(userId, adminUsername);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("userId", updatedAction.getTargetUser().getUserId());
            responseData.put("username", updatedAction.getTargetUser().getUsername());
            responseData.put("actionType", updatedAction.getActionType() != null
                    ? updatedAction.getActionType().name()
                    : "INACTIVE");

            return ResponseEntity.ok(new ApiResponseDTO(200, "Status updated", responseData));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(new ApiResponseDTO(500, "Internal server error", Map.of("error", e.getMessage())));
        }
    }
}
