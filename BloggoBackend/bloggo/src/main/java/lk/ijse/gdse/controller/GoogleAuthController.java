package lk.ijse.gdse.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lk.ijse.gdse.entity.RoleName;
import lk.ijse.gdse.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth/google")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342",
        allowCredentials = "true")
@Tag(name = "Auth", description = "Operations related to Google Authentication and Authorization")

public class GoogleAuthController {
    private final JWTUtil jwtUtil;
    @GetMapping("/success")
    public ResponseEntity<?> googleLoginSuccess(@AuthenticationPrincipal OAuth2User principal) {
        // Get user info from Google
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");

        // Optionally, create a local user in DB or issue JWT
        String jwt = jwtUtil.generateToken(email, RoleName.USER);

        // Send JWT to frontend
        Map<String, String> response = new HashMap<>();
        response.put("jwt", jwt);
        response.put("email", email);
        response.put("name", name);

        return ResponseEntity.ok(response);
    }
}
