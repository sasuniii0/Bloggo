
package lk.ijse.gdse.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lk.ijse.gdse.dto.*;
import lk.ijse.gdse.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342",
        allowCredentials = "true")
@Tag(name = "Auth", description = "Operations related to Authentication and Authorization")

public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    @Operation(summary = "user registration to the application")
    public ResponseEntity<ApiResponseDTO> registerUser(@RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(new ApiResponseDTO(
                200,
                "User registered successfully",
                authService.register(userDTO)
        ));
    }

    @PostMapping("/signing")
    @Operation(summary = "user login to the application")
    public ResponseEntity<ApiResponseDTO> authenticateUser(@RequestBody AuthDTO authDTO) {
        return ResponseEntity.ok(new ApiResponseDTO(
                200,
                "User authenticated successfully",
                authService.authenticate(authDTO)
        ));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "forgot password option")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) throws IOException {
        authService.sendResetPwdLink(request.getEmail());
        return ResponseEntity.ok("Password reset link sent if the email exists.");
    }

    @GetMapping("/reset-password/{token}")
    @Operation(summary = "reset password option with reset token")
    public void handleResetLink(@PathVariable String token, HttpServletResponse response) throws IOException {
        if (!authService.validateResetToken(token)) {
            response.sendRedirect("http://localhost:63342/Bloggo-springboot/BloggoFrontend/pages/invalid-token.html");
            return;
        }

        response.sendRedirect(
                "http://localhost:63342/Bloggo-springboot/BloggoFrontend/pages/reset-password.html?token=" + token
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        boolean success = authService.resetPassword(token, newPassword);
        if (success) {
            return ResponseEntity.ok("Password reset successfully.");
        } else {
            return ResponseEntity.badRequest().body("Invalid or expired token.");
        }
    }
}
