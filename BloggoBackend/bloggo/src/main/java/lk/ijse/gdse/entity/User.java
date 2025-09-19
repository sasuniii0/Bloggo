package lk.ijse.gdse.entity;

import jakarta.persistence.*;
import lombok.*;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "user")
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;


    @NotNull(message = "Username cannot be blank")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(
            regexp = "^[A-Za-z0-9_]+$",
            message = "Username can only contain letters, numbers, and underscores"
    )
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @NotNull(message = "Email cannot be blank")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @NotNull(message = "Password cannot be blank")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters long")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
            message = "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
    )
    @Column(nullable = false)
    private String password;

    @Pattern(
            regexp = "^(https?://).+\\.(jpg|jpeg|png|gif|webp)$",
            message = "Profile image must be a valid URL ending with jpg, jpeg, png, gif, or webp"
    )
    @Column(columnDefinition = "LONGTEXT")
    private String profileImage;

    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    @Pattern(
            regexp = "^[A-Za-z0-9\\s,.?!'\";:()\\-@#&%$*]*$",
            message = "Bio contains invalid characters"
    )
    @Column(length = 500)
    private String bio;

    @Enumerated(EnumType.STRING)
    private RoleName role;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ActionType status;  // or String if you prefer


    @Enumerated(EnumType.STRING)
    private MembershipStatus membershipStatus;

    private String resetToken;

    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }


    @OneToMany(mappedBy = "user")
    private List<Post> posts;

    @OneToMany(mappedBy = "user")
    private List<Share> shares;

    @OneToMany(mappedBy = "user")
    private List<Bookmark> bookmarks;

    @OneToMany(mappedBy = "targetUser")
    private List<AdminAction> adminActions;

    @OneToMany(mappedBy = "user")
    private List<Boost> boosts;

    @OneToMany(mappedBy = "user")
    private List<Comment> comments;

    @OneToMany(mappedBy = "user")
    private List<Notification> notifications;

    @OneToMany(mappedBy = "user")
    private List<Payment> payments;

    // Followers / Following
    @OneToMany(mappedBy = "follower")
    private List<Follow> following; // Users this user follows

    @OneToMany(mappedBy = "followed")
    private List<Follow> followers; // Users following this user


    // Add wallet relationship
    @OneToOne(mappedBy = "userId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Wallet wallet;


}
