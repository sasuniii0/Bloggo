package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.AuthDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.dto.UserProfileDTO;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
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
@CrossOrigin(origins = "http://localhost:63342",
        allowCredentials = "true")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping("/save")
    public ResponseEntity<ApiResponseDTO> saveUser(@RequestBody User user) {
        User savedUser = userService.saveUser(user);
        return new ResponseEntity<>(
                new ApiResponseDTO(
                        200,
                        "User saved successfully",
                        savedUser
                ), HttpStatus.OK
        );
    }

    @PostMapping("/edit")
    public ResponseEntity<ApiResponseDTO> editUser(@RequestBody User user) {
        User updatedUser = userService.editUser(user);
        return new ResponseEntity<>(
                new ApiResponseDTO(
                        200,
                        "User updated successfully",
                        updatedUser
                ), HttpStatus.OK
        );
    }

    @GetMapping("/getAll")
    public ResponseEntity<ApiResponseDTO> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(
                new ApiResponseDTO(
                        200,
                        "Users retrieved successfully",
                        users
                ), HttpStatus.OK
        );
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponseDTO> deleteUser(@RequestParam Long userId) {
        userService.deleteUser(userId);
        return new ResponseEntity<>(
                new ApiResponseDTO(
                        200,
                        "User deleted successfully",
                        null
                ), HttpStatus.OK
        );
    }

    @GetMapping
    public ResponseEntity<Map<String,Object>> getUsers(
            @RequestParam(defaultValue = "0")int offset,
            @RequestParam (defaultValue = "3") int limit
    ){
        List<UserDTO> users = userService.getUsers(offset,limit);
        Map<String,Object> response = new HashMap<>();
        response.put("users", users);
        return new ResponseEntity<>(response, HttpStatus.OK);
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
            ){
        User existing = userService.getUserById(id);
        if (existing == null) {
            return ResponseEntity.status(404).body(new ApiResponseDTO(404, "User not found", null));
        }
        existing.setUsername(user.getUsername());
        existing.setEmail(user.getEmail());
        existing.setBio(user.getBio());
        existing.setProfileImage(user.getProfileImage());

        User updated = userService.updateProfileUser(existing,principal.getName());
        return ResponseEntity.ok(new ApiResponseDTO(200, "User updated successfully", updated));
    }
}
