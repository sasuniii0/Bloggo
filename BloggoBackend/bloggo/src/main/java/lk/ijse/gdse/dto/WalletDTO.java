package lk.ijse.gdse.dto;

import lk.ijse.gdse.entity.RoleName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class WalletDTO {
    private Long id;
    private Double balance;
    private Long userId;
    private String username; // new
    private String email;

    public WalletDTO(Long id, Double balance, Long userId) {
        this.id = id;
        this.balance = balance;
        this.userId = userId;
    }
}
