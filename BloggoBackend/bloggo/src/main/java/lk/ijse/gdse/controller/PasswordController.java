package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.PasswordChangeRequestDTO;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/password")
@CrossOrigin(origins = "http://localhost:63342",
        allowCredentials = "true")
public class PasswordController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

   /* @PostMapping("/change-password")
    public ResponseEntity<ApiResponseDTO> changePasscode(
            @RequestBody PasswordChangeRequestDTO passwordChangeRequestDTO,
            @RequestParam Long userId) {

        Optional<User> userOptional = userService.findUserById(userId);

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseDTO(400, "User not found", null));
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(passwordChangeRequestDTO.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponseDTO(400, "Current password is incorrect", null));
        }

        user.setPassword(passwordEncoder.encode(passwordChangeRequestDTO.getNewPassword()));

        userService.updateUser(user); // ✅ only update, no new wallet

        return ResponseEntity.ok(
                new ApiResponseDTO(200, "Password updated successfully!", null)
        );
    }*/

}
