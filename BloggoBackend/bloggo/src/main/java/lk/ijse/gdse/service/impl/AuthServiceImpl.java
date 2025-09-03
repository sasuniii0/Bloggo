package lk.ijse.gdse.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lk.ijse.gdse.dto.AuthDTO;
import lk.ijse.gdse.dto.AuthResponseDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.entity.MembershipStatus;
import lk.ijse.gdse.entity.RoleName;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.service.AuthService;
import lk.ijse.gdse.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final Map<String, String> tokenStorage = new HashMap<>(); // token -> email
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SendGridEmailServiceImpl emailService;
    private final JWTUtil jwtUtil;
    private final JavaMailSenderImpl mailSender;

    @Override
    public AuthResponseDTO authenticate(AuthDTO authDTO) {
        System.out.println(authDTO.getUsername());
        User user = userRepository.findByUsername(authDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(authDTO.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid Credentials");
        }

        String token = jwtUtil.generateToken(authDTO.getUsername());
        String role = user.getRole().name(); // Get the user's role
        String username = user.getUsername(); // Get the user's username
        //Long id = user.getUserId();
        return new AuthResponseDTO(token, role, username);
    }

    @Override
    public String register(UserDTO userDTO) {
        if (userRepository.findByUsername(userDTO.getUsername()).isPresent()) {
            throw new RuntimeException("User already exists");
        }
        User user = User.builder()
                .username(userDTO.getUsername())
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .profileImage(userDTO.getProfileImage())
                .bio(userDTO.getBio())
                .role(RoleName.USER)
                .membershipStatus(MembershipStatus.FREE)
                .createdAt(LocalDateTime.now())
                .lastLogin(LocalDateTime.now())
                .build();
        userRepository.save(user);
        return "User registered successfully";
    }

    @Override
    public void sendResetPwdLink(String email) {
        // Generate token
        String token = UUID.randomUUID().toString();
        tokenStorage.put(token, email);

        // Send email via SendGrid
        // Handle exception: expired, invalid, or max credits
        try {
            SendGridEmailServiceImpl.sendPasswordResetEmail(email, token);
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public boolean resetPassword(String token, String newPassword) {
        String email = tokenStorage.get(token);
        if (email == null) return false;

        // TODO: Update user password in DB (encode first)
        String encodedPassword = passwordEncoder.encode(newPassword);
        System.out.println("Reset password for: " + email + " -> " + encodedPassword);

        tokenStorage.remove(token); // invalidate token
        return true;
    }

}
