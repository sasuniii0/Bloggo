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
@Builder
@Entity
@Table(name = "payment")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user; // User who made the payment
    private Double amount; // Amount paid
    private String currency; // Currency of the payment
    private String paymentMethod;
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;
    private Long transactionId;
    private LocalDateTime createdAt;
}
