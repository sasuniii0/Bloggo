package lk.ijse.gdse.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
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
