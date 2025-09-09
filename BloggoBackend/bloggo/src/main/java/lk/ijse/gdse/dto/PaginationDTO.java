package lk.ijse.gdse.dto;

import lk.ijse.gdse.entity.AdminAction;
import lk.ijse.gdse.entity.RoleName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class PaginationDTO {
    private Long id;
    private String username;
    private String email;
    private RoleName role;
    private AdminAction action;
}
