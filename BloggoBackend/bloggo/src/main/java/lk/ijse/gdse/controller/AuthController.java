package lk.ijse.gdse.controller;

import jakarta.mail.MessagingException;
import lk.ijse.gdse.dto.*;
import lk.ijse.gdse.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342",
        allowCredentials = "true")

public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponseDTO> registerUser(@RequestBody UserDTO userDTO) {
       return ResponseEntity.ok(new ApiResponseDTO(
               200,
                "User registered successfully",
               authService.register(userDTO)
       ));
    }

    @PostMapping("/signing")
    //@PreAuthorize("hasAnyRole('USER', 'MEMBER', 'ADMIN')")
    public ResponseEntity<ApiResponseDTO> authenticateUser(@RequestBody AuthDTO authDTO) {
        return ResponseEntity.ok(new ApiResponseDTO(
                200,
                "User authenticated successfully",
                authService.authenticate(authDTO)
        ));
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) {
        authService.sendResetPwdLink(request.getEmail());
        return ResponseEntity.ok("Password reset link sent if the email exists.");
    }


    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        boolean success = authService.resetPassword(request.getToken(), request.getNewPassword());
        if (success) {
            return ResponseEntity.ok("Password reset successfully.");
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired token.");
        }
    }
}
