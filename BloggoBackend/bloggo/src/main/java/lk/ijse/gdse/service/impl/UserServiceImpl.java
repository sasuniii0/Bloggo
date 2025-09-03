package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.dto.UserProfileDTO;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.repository.UserRepository;
import lk.ijse.gdse.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    @Override
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public User editUser(User user) {
        User updatedUser =userRepository.getUserByUserId(user.getUserId());
        updatedUser.setUsername(user.getUsername());
        updatedUser.setEmail(user.getEmail());
        updatedUser.setRole(user.getRole());
        updatedUser.setMembershipStatus(user.getMembershipStatus());
        return userRepository.save(updatedUser);
    }

    @Override
    public List<User> getAllUsers() {
        return  userRepository.findAll();
    }

    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.getUserByUserId(userId);
        userRepository.delete(user);
    }

    @Override
    public User findByUsername(String name) {
        return userRepository.findByUsername(name)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public List<String> getAllUsernames() {
        return userRepository.getAllUsernames();
    }

    @Override
    public List<UserDTO> getUsers(int offset, int limit) {
        Pageable pageable = PageRequest.of(offset,limit);
        return userRepository.findAll(pageable)
                .stream()
                .map(user -> new UserDTO(user.getUserId(), user.getUsername()))
                .toList();
    }

    @Override
    public UserProfileDTO getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserProfileDTO(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getProfileImage(),
                user.getBio(),
                user.getFollowers().size(),
                user.getFollowing().size()
        );
    }


}
