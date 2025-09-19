package lk.ijse.gdse.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.ijse.gdse.dto.*;
import lk.ijse.gdse.entity.Notification;
import lk.ijse.gdse.entity.Post;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.entity.Wallet;
import lk.ijse.gdse.service.PostService;
import lk.ijse.gdse.service.UserService;
import lk.ijse.gdse.service.WalletService;
import lk.ijse.gdse.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
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
@Tag(name = "User", description = "Operations related to User")

public class UserController {

    private final UserService userService;
    private final WalletService walletService;
    private final JWTUtil jwtUtil;
    private final PostService postService;

    @PostMapping("/save")
    @Operation(summary = "save the user")
    public ResponseEntity<ApiResponseDTO> saveUser(@RequestBody User user) {
        return ResponseEntity.ok(new ApiResponseDTO(200, "User saved successfully", userService.saveUser(user)));
    }

    @PostMapping("/edit")
    @Operation(summary = "edit the user")
    public ResponseEntity<ApiResponseDTO> editUser(@RequestBody User user) {
        return ResponseEntity.ok(new ApiResponseDTO(200, "User updated successfully", userService.editUser(user)));
    }

    @DeleteMapping("/delete")
    @Operation(summary = "delete the user")
    public ResponseEntity<ApiResponseDTO> deleteUser(@RequestParam Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(new ApiResponseDTO(200, "User deleted successfully", null));
    }

    @GetMapping("/me")
    @Operation(summary = "get the user by logged user id")
    public ResponseEntity<UserProfileDTO> getLoggedUser(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getCurrentUser(userDetails.getUsername()));
    }

    @PostMapping("/payments/success")
    @Operation(summary = "get the message of payment success for the user")
    public ResponseEntity<Map<String, Object>> paymentSuccess(@RequestParam Long userId) {
        User user = userService.upgradeMembership(userId);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole()); // include MEMBER role

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Payment successful, membership upgraded");
        response.put("token", token);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/wallet")
    @Operation(summary = "get the user wallet by userId")
    public ResponseEntity<ApiResponseDTO> getWallet(@PathVariable Long userId) {
        Wallet wallet = walletService.getWalletByUserId(userId);
        return ResponseEntity.ok(new ApiResponseDTO(200, "Wallet found", wallet));
    }

    @GetMapping("/wallet/{userId}")
    @Operation(summary = "get the wallet by id")
    public ResponseEntity<ApiResponseDTO> getWalletById(@PathVariable Long userId) {
        Wallet wallet = walletService.getWalletByUserId(userId);
        return ResponseEntity.ok(new ApiResponseDTO(200, "Wallet found", wallet));
    }

    @PutMapping("/profileUpdate/{id}")
    @PreAuthorize("hasAnyRole('USER', 'MEMBER')")
    @Operation(summary = "update the user profile")
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
    @Operation(summary = "get user profile by username")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getCurrentUser(username));
    }

    @GetMapping("/members/{id}")
    @Operation(summary = "get member profile by id")
    public ResponseEntity<UserDTO> getMemberProfile(@PathVariable Long id) {
        try {
            UserDTO userDTO = userService.getUserDTOById(id);
            return ResponseEntity.ok(userDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/get/{userId}/posts")
    @Operation(summary = "get posts by userId")
    public ResponseEntity<List<PostDTO>> getUserPosts(@PathVariable Long userId) {
        List<PostDTO> posts = postService.getPostsByUserId(userId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{username}/posts")
    @Operation(summary = "get posts by username")
    public ResponseEntity<List<PostDTO>> getUserPosts(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserPosts(username));
    }

    @GetMapping("/search/{keyword}")
    @Operation(summary = "search user by keyword")
    public ResponseEntity<ApiResponseDTO> searchUsers(@PathVariable String keyword) {
        List<UserDTO> users = userService.searchUsers(keyword);
        return ResponseEntity.ok(new ApiResponseDTO(200, "Users found", users));
    }

    @GetMapping("/getAll-pagination")
    @Operation(summary = "get users by pagination")
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
    @Operation(summary = "get All the members")
    public ResponseEntity<ApiResponseDTO> getMembers(@RequestParam Long loggedUserId) {
        List<UserDTO> members = userService.getAllMembersExcludingAdminAndSelf(loggedUserId);
        return ResponseEntity.ok(new ApiResponseDTO(200, "Members fetched", members));
    }

    @GetMapping("/suggestions")
    @Operation(summary = "get user suggestions")
    public ResponseEntity<ApiResponseDTO> getSuggestions(@RequestParam Long loggedUserId, @RequestParam Long profileOwnerId) {
        List<UserDTO> members = userService.getAllMembersExcludingLoggedUserAndProfileOwner(loggedUserId, profileOwnerId);
        return ResponseEntity.ok(new ApiResponseDTO(200, "Members fetched", members));
    }

    @GetMapping("/getWallet/{userId}")
    @Operation(summary = "get user wallet balance by userId")
    public ResponseEntity<ApiResponseDTO> getWalletBalanceByUserId(@PathVariable Long userId) {
        List<WalletDTO> wallet = walletService.getWalletBalanceByUserId(userId);
        return ResponseEntity.ok(new ApiResponseDTO(200, "Wallet found", wallet));
    }
}
