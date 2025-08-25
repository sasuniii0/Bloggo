package lk.ijse.gdse.service;

import lk.ijse.gdse.dto.TagDTO;

import java.util.List;

public interface TagService {
    List<TagDTO> getTags(int offset, int limit);
}
