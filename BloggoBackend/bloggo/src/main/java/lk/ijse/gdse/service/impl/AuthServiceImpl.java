package lk.ijse.gdse.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lk.ijse.gdse.dto.AuthDTO;
import lk.ijse.gdse.dto.AuthResponseDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.entity.ActionType;
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

        String token = jwtUtil.generateToken(authDTO.getUsername(),user.getRole());
        String role = user.getRole().name(); // Get the user's role
        String username = user.getUsername(); // Get the user's username
        Long id = user.getUserId();


        /* *//*System.out.println("Generated Token: " + token);
        System.out.println("User Role: " + role);
        System.out.println("Username: " + username);
        System.out.println("User ID: " + id);*//*
        return new AuthResponseDTO(token, role, username,id);*/

        return AuthResponseDTO.builder()
                .accessToken(token)
                .role(role)
                .username(username)
                .userId(id)
                .build();

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
                .status(ActionType.ACTIVE)
                .createdAt(LocalDateTime.now())
                .lastLogin(LocalDateTime.now())
                .build();
        userRepository.save(user);
        return "User registered successfully";
    }

    @Override
    public void sendResetPwdLink(String email) throws IOException {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate JWT token for password reset
        String token = jwtUtil.generatePasswordResetToken(user.getEmail());

        String resetLink = "http://localhost:63342/Bloggo-springboot/BloggoFrontend/pages/reset-password.html?token=" + token;

        // Send email via SendGrid
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }


    @Override
    public boolean resetPassword(String token, String newPassword) {
        if (!jwtUtil.validateToken(token)) return false;

        String email = jwtUtil.getUsernameFromToken(token);
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }

    @Override
    public boolean validateResetToken(String token) {
        return jwtUtil.validateToken(token);
    }

}
