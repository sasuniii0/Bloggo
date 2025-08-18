package lk.ijse.gdse.service;

import lk.ijse.gdse.dto.AuthDTO;
import lk.ijse.gdse.dto.AuthResponseDTO;
import lk.ijse.gdse.dto.UserDTO;

public interface AuthService {
    AuthResponseDTO authenticate(AuthDTO authDTO);
    String register(UserDTO userDTO);
}
