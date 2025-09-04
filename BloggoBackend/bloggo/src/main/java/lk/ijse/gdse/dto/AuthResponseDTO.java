package lk.ijse.gdse.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class AuthResponseDTO {
    private String accessToken;
    private String role;
    private String username;
    private Long userId;
}
