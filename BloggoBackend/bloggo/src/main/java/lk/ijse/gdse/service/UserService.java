package lk.ijse.gdse.service;

import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.dto.UserProfileDTO;
import lk.ijse.gdse.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface UserService {

    User saveUser(User user);

    User editUser(User user);

    void deleteUser(Long userId);

    List<UserDTO> getUsers(int offset, int limit);

    UserProfileDTO getCurrentUser(String username);

    User updateProfileUser(User existing, String loggedUsername);

    User getUserById(Long id);

    User updateProfile(String loggedUsername, String username, String email, String bio, MultipartFile profileImage) throws IOException;

    User findByUsername(String name);

    List<UserDTO> getUserByRole(String user);

    List<PostDTO> getUserPosts(String username);
}
