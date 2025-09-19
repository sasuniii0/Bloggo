package lk.ijse.gdse.service;

import lk.ijse.gdse.dto.TagDTO;
import lk.ijse.gdse.entity.Tag;

import java.util.List;

public interface TagService {
    List<TagDTO> getTags(int offset, int limit);
    public List<Tag> searchTags(String keyword);
}
