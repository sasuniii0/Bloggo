package lk.ijse.gdse.entity;

import jakarta.persistence.*;
import lombok.*;

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

    private String title;

    @Column(columnDefinition = "TEXT") // for MySQL/Postgres
    private String content;

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
