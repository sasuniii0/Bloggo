package lk.ijse.gdse.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table(name = "broadcastmessage")
public class BroadcastMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    @Pattern(
            regexp = "^[A-Za-z0-9 ,.?!'\"-]+$",
            message = "Title can only contain letters, numbers, spaces, and basic punctuation"
    )
    @Column(nullable = false)
    private String title;

    @NotNull(message = "Content cannot be empty")
    @Size(min = 10, max = 5000, message = "Content must be between 10 and 5000 characters")
    @Pattern(
            regexp = "^[A-Za-z0-9\\s,.?!'\";:()\\-@#&%$*\\n]+$",
            message = "Content contains invalid characters"
    )
    @Lob // Large object for rich text content
    @Column(nullable = false)
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now(); // default value

}
