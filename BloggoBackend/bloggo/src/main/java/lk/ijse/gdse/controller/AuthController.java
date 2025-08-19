package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.AuthDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


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
    public ResponseEntity<ApiResponseDTO> authenticateUser(@RequestBody AuthDTO authDTO) {
        return ResponseEntity.ok(new ApiResponseDTO(
                200,
                "User authenticated successfully",
                authService.authenticate(authDTO)
        ));
    }
}
