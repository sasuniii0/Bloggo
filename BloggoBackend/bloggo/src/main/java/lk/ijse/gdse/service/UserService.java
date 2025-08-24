package lk.ijse.gdse.service;


import lk.ijse.gdse.entity.User;

import java.util.List;

public interface UserService {
    User saveUser(User user);

    User editUser(User user);

    List<User> getAllUsers();

    void deleteUser(Long userId);

    User findByUsername(String name);

    List<String> getAllUsernames();
}
