package lk.ijse.gdse.service.impl;

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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtil jwtUtil;

    @Override
    public AuthResponseDTO authenticate(AuthDTO authDTO) {
        System.out.println(authDTO);
        User user = userRepository.findByUsername(authDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(authDTO.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid Credentials");
        }

        String token = jwtUtil.generateToken(authDTO.getUsername());
        String role = user.getRole().name(); // Get the user's role
        String username = user.getUsername(); // Get the user's username
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
}
