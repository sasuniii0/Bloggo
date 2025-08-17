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
    private Long userId; // User who made the payment
    private Double amount; // Amount paid
    private String currency; // Currency of the payment
    private String paymentMethod; // e.g., "Credit Card", "PayPal"
    private PaymentStatus status; // e.g., "Completed", "Pending", "Failed"
    private Long transactionId; // Unique identifier for the transaction
    private LocalDateTime createdAt;
}
