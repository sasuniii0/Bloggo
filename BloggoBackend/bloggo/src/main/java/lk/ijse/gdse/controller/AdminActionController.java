package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.entity.AdminAction;
import lk.ijse.gdse.service.AdminActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin-actions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342",allowCredentials = "true")
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

    @PatchMapping("/status/{id}")
    public ResponseEntity<ApiResponseDTO> updateActionStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        AdminAction updatedAction = adminActionService.updateActionStatus(id, status);
        ApiResponseDTO response = new ApiResponseDTO(
                200,
                "Admin action status updated successfully",
                updatedAction);
        return ResponseEntity.ok(response);
    }
}
