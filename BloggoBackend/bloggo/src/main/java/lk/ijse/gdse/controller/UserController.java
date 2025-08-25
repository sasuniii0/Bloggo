package lk.ijse.gdse.controller;

import lk.ijse.gdse.dto.ApiResponseDTO;
import lk.ijse.gdse.dto.AuthDTO;
import lk.ijse.gdse.dto.UserDTO;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342",
        allowCredentials = "true")
public class UserController {

    private final UserService userService;

    @PostMapping("/save")
    public ResponseEntity<ApiResponseDTO> saveUser(@RequestBody User user) {
        User savedUser = userService.saveUser(user);
        return new ResponseEntity<>(
                new ApiResponseDTO(
                        200,
                        "User saved successfully",
                        savedUser
                ), HttpStatus.OK
        );
    }

    @PostMapping("/edit")
    public ResponseEntity<ApiResponseDTO> editUser(@RequestBody User user) {
        User updatedUser = userService.editUser(user);
        return new ResponseEntity<>(
                new ApiResponseDTO(
                        200,
                        "User updated successfully",
                        updatedUser
                ), HttpStatus.OK
        );
    }

    @GetMapping("/getAll")
    public ResponseEntity<ApiResponseDTO> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(
                new ApiResponseDTO(
                        200,
                        "Users retrieved successfully",
                        users
                ), HttpStatus.OK
        );
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponseDTO> deleteUser(@RequestParam Long userId) {
        userService.deleteUser(userId);
        return new ResponseEntity<>(
                new ApiResponseDTO(
                        200,
                        "User deleted successfully",
                        null
                ), HttpStatus.OK
        );
    }

    @GetMapping
    public ResponseEntity<Map<String,Object>> getUsers(
            @RequestParam(defaultValue = "0")int offset,
            @RequestParam (defaultValue = "3") int limit
    ){
        List<UserDTO> users = userService.getUsers(offset,limit);
        Map<String,Object> response = new HashMap<>();
        response.put("users", users);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
