package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.*;
import lk.ijse.gdse.entity.Notification;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.entity.Wallet;
import lk.ijse.gdse.service.UserService;
import lk.ijse.gdse.service.WalletService;
import lk.ijse.gdse.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class UserController {

    private final UserService userService;
    private final WalletService walletService;
    private final JWTUtil jwtUtil;

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

    @PostMapping("/payments/success")
    public ResponseEntity<Map<String, Object>> paymentSuccess(@RequestParam Long userId) {
        // Upgrade role in DB
        User user = userService.upgradeMembership(userId);

        // Generate a new JWT for the user
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole()); // include MEMBER role

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Payment successful, membership upgraded");
        response.put("token", token);

        return ResponseEntity.ok(response);
    }


    // Optional: Return wallet & earnings for member UI
    @GetMapping("/user/{userId}/wallet")
    public ResponseEntity<ApiResponseDTO> getWallet(@PathVariable Long userId) {
        Wallet wallet = walletService.getWalletByUserId(userId);
        return ResponseEntity.ok(new ApiResponseDTO(200, "Wallet found", wallet));
    }

    @PutMapping("/profileUpdate/{id}")
    @PreAuthorize("hasAnyRole('USER', 'MEMBER')")
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

    /*@GetMapping("user-only")
    @PreAuthorize("hasAnyRole('USER', 'MEMBER')")
    public ResponseEntity<ApiResponseDTO> getRoleWithoutAdmin(){
        return ResponseEntity.ok(new ApiResponseDTO(
                200,
                "You are a USER or MEMBER",
                userService.getAllMembersExcludingAdminAndSelf()));
    }*/

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getCurrentUser(username));
    }
    @GetMapping("/{username}/posts")
    public ResponseEntity<List<PostDTO>> getUserPosts(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserPosts(username));
    }

    @GetMapping("/search/{keyword}")
    public ResponseEntity<ApiResponseDTO> searchUsers(@PathVariable String keyword) {
        List<UserDTO> users = userService.searchUsers(keyword);
        return ResponseEntity.ok(new ApiResponseDTO(200, "Users found", users));
    }

    @GetMapping("/getAll-pagination")
    public ResponseEntity<ApiResponseDTO> getUsers(@RequestParam int page,
                                                   @RequestParam int size) {
        Page<PaginationDTO> users = userService.getAllUsers(PageRequest.of(page, size));

        Map<String, Object> data = new HashMap<>();
        data.put("content", users.getContent());
        data.put("totalPages", users.getTotalPages());
        data.put("totalElements", users.getTotalElements());

        return ResponseEntity.ok(new ApiResponseDTO(200, "Users fetched", data));
    }

    @GetMapping("/members")
    public ResponseEntity<ApiResponseDTO> getMembers(@RequestParam Long loggedUserId) {
        List<UserDTO> members = userService.getAllMembersExcludingAdminAndSelf(loggedUserId);
        return ResponseEntity.ok(new ApiResponseDTO(200, "Members fetched", members));
    }

}
