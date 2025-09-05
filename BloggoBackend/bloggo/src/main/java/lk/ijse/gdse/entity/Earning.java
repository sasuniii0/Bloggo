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
@Builder
@Table(name = "earning")
public class Earning {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long earningId;

    @ManyToOne
    @JoinColumn(name = "walletId", nullable = false)
    private Wallet walletId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Source source;
    private Double amount;

    @ManyToOne
    @JoinColumn(name = "postId", nullable = false)
    private Post post;
    private LocalDateTime createdAt;
}
