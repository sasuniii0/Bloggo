package lk.ijse.gdse.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ApiResponseDTO {
    private int status;
    private String message;
    private Object data;
}
