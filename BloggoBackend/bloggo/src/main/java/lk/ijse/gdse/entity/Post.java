package lk.ijse.gdse.entity;

import jakarta.persistence.*;
import lombok.*;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "post")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postId;
    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @NotNull(message = "Title cannot be empty")
    @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
    @Pattern(
            regexp = "^[A-Za-z0-9 ,.?!'\"-]+$",
            message = "Title can only contain letters, numbers, spaces, and basic punctuation"
    )
    private String title;

    @NotNull(message = "Content cannot be empty")
    @Size(min = 10, max = 200000, message = "Content must be between 10 and 20000 characters")
    @Pattern(
            regexp = "^[A-Za-z0-9\\s,.?!'\";:()\\-@#&%$*\\n]+$",
            message = "Content contains invalid characters"
    )
    @Column(columnDefinition = "TEXT") // for MySQL/Postgres
    private String content;

    @Pattern(
            regexp = "^(https?://).+\\.(jpg|jpeg|png|gif|webp)$",
            message = "Cover image must be a valid URL ending with jpg, jpeg, png, gif, or webp"
    )
    @Column(columnDefinition = "LONGTEXT") // for MySQL/Postgres
    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    private PostStatus status;
    private LocalDateTime scheduledAt;
    private LocalDateTime publishedAt;
    private LocalTime readingTime;
    private Integer viewsCount=0;
    private Integer commentsCount=0;
    private Integer boostCount=0;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Size(max = 500, message = "Summary cannot exceed 500 characters")
    @Pattern(
            regexp = "^[A-Za-z0-9\\s,.?!'\";:()\\-@#&%$*]+$",
            message = "Summary contains invalid characters"
    )
    @Column(columnDefinition = "TEXT")
    private String summary;

    @Transient // This field won't be persisted
    private boolean autoGenerateSummary = true;


    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<Comment> comments;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<Earning> earnings;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<Share> shares;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<Bookmark> bookmarks;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<Boost> boosts;

    @OneToMany(mappedBy = "targetPost", cascade = CascadeType.ALL)
    private List<AdminAction> adminActions;

    @ManyToMany
    @JoinTable(
            name = "post_tag",
            joinColumns = @JoinColumn(name = "postId"),
            inverseJoinColumns = @JoinColumn(name = "tagId")
    )
    private Set<Tag> tags = new HashSet<>();
}
