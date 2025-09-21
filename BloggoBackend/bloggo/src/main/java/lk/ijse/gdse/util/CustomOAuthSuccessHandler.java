package lk.ijse.gdse.util;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lk.ijse.gdse.entity.RoleName;
import lk.ijse.gdse.entity.User;
import lk.ijse.gdse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor

public class CustomOAuthSuccessHandler implements AuthenticationSuccessHandler {
    @Value("${frontend.url}")
    private String frontendUrl;

    private final JWTUtil jwtUtil;
    private  final UserRepository userRepository;
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        DefaultOAuth2User user = (DefaultOAuth2User) authentication.getPrincipal();
        String email = user.getAttribute("email");

        // Assume ROLE_USER for OAuth2 users
        String token = jwtUtil.generateToken(email, RoleName.USER);

        response.setContentType("application/json");
        response.getWriter().write("{\"token\": \"" + token + "\"}");

        /*OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        System.out.println(email);

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setUsername(email.split("@")[0]); // optional default username
                    newUser.setPassword(UUID.randomUUID().toString()); // dummy password
                    newUser.setRole(RoleName.USER);
                    return userRepository.save(newUser);
                });

        // Get the username
        String username = user.getUsername();
        System.out.println("Logged-in username: " + username);


        // Generate JWT
        String token = jwtUtil.generateToken(username, RoleName.USER);

        // Store JWT in HttpOnly cookie
        Cookie jwtCookie = new Cookie("jwtToken", token);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setPath("/"); // accessible across your frontend
        jwtCookie.setMaxAge(60 * 60); // 1 hour, adjust if needed
        response.addCookie(jwtCookie);

        Cookie usernameCookie = new Cookie("username", username);
        usernameCookie.setHttpOnly(false);
        usernameCookie.setPath("/");
        usernameCookie.setMaxAge(60 * 60); // 1 hour
        response.addCookie(usernameCookie);

        response.sendRedirect("/dashboard.html");*/

    }
}
