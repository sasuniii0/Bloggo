package lk.ijse.gdse.service;

import lk.ijse.gdse.dto.AuthDTO;
import lk.ijse.gdse.dto.AuthResponseDTO;
import lk.ijse.gdse.dto.UserDTO;

import java.io.IOException;

public interface AuthService {
    AuthResponseDTO authenticate(AuthDTO authDTO);
    String register(UserDTO userDTO);
    void sendResetPwdLink(String email) throws IOException;
    boolean resetPassword(String token, String newPassword);
    boolean validateResetToken(String token);
}
