package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.dto.UserProfileDTO;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class UserController {

    private final UserService userService;

    @PostMapping("/save")
    public ResponseEntity<ApiResponseDTO> saveUser(@RequestBody User user) {
        return ResponseEntity.ok(new ApiResponseDTO(200, "User saved successfully", userService.saveUser(user)));
    }

    @PostMapping("/edit")
    public ResponseEntity<ApiResponseDTO> editUser(@RequestBody User user) {
        return ResponseEntity.ok(new ApiResponseDTO(200, "User updated successfully", userService.editUser(user)));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponseDTO> deleteUser(@RequestParam Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(new ApiResponseDTO(200, "User deleted successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getLoggedUser(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getCurrentUser(userDetails.getUsername()));
    }

    @PutMapping("/profileUpdate/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponseDTO> updateProfile(
            @PathVariable Long id,
            @RequestBody User user,
            Principal principal
    ) {
        User existing = userService.getUserById(id);
        if (!existing.getUsername().equals(principal.getName())) {
            return ResponseEntity.status(403).body(new ApiResponseDTO(403, "Unauthorized", null));
        }

        existing.setUsername(user.getUsername());
        existing.setEmail(user.getEmail());
        existing.setBio(user.getBio());
        existing.setProfileImage(user.getProfileImage());

        return ResponseEntity.ok(new ApiResponseDTO(200, "User updated successfully",
                userService.updateProfileUser(existing, principal.getName())));
    }

    @GetMapping("user-only")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponseDTO> getRoleOnlyUser(){
        return ResponseEntity.ok(new ApiResponseDTO(200, "You are a USER",
                userService.getUserByRole("USER")));
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getCurrentUser(username));
    }
    @GetMapping("/{username}/posts")
    public ResponseEntity<List<PostDTO>> getUserPosts(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserPosts(username));
    }
}
