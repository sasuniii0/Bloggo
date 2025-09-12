package lk.ijse.gdse.service;

import lk.ijse.gdse.dto.PaginationDTO;
import lk.ijse.gdse.dto.PostDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.dto.UserProfileDTO;
import lk.ijse.gdse.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface UserService {

    User saveUser(User user);

    User editUser(User user);

    void deleteUser(Long userId);

    List<UserDTO> getUsers(int offset, int limit);

    UserProfileDTO getCurrentUser(String username);

    User updateProfileUser(User existing, String loggedUsername);

    User getUserById(Long id);

    User updateProfile(String loggedUsername, String username, String email, String bio, MultipartFile profileImage) throws IOException;

    User findByEmail(String email);

    User upgradeMembership(Long userId);

    User getLoggedInUser(String username);
    User findByUsername(String name);

    List<UserDTO> getUserByRole(String user);

    List<PostDTO> getUserPosts(String username);

    List<UserDTO> searchUsers(String keyword);

    Page<PaginationDTO> getUsersForAdmin(int page, int size);

    Page<PaginationDTO> getAllUsers(Pageable pageable);

    List<UserDTO> getAllMembersExcludingAdminAndSelf(Long loggedUserId);

    UserDTO getUserDTOById(Long userId);

    List<UserDTO> getAllMembersExcludingLoggedUserAndProfileOwner(Long loggedUserId, Long profileOwnerId);

    Optional<User> findUserById(Long userId);

    void updateUser(User user);
}
