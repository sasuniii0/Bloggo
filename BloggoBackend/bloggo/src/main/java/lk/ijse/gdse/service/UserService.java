package lk.ijse.gdse.service;


import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.dto.UserProfileDTO;
import lk.ijse.gdse.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface UserService {
    User saveUser(User user);

    User editUser(User user);

    List<User> getAllUsers();

    void deleteUser(Long userId);

    User findByUsername(String name);

    List<String> getAllUsernames();

    List<UserDTO> getUsers(int offset, int limit);

    UserProfileDTO getCurrentUser(String username);

    User updateProfile(String loggedUsername, String username, String email, String bio, MultipartFile profileImage) throws IOException;

    User getUserById(Long id);

    User updateProfileUser(User existing, String name);
}
