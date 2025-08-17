package lk.ijse.gdse.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "boost")
@Builder
public class Boost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long boostId;
    private Long postId;
    private Long userId;
    private LocalDateTime createdAt;
}
