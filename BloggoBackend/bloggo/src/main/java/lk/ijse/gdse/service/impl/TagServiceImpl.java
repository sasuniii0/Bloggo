package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.dto.TagDTO;
import lk.ijse.gdse.repository.TagRepository;
import lk.ijse.gdse.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {
    private final TagRepository tagRepository;
    @Override
    public List<TagDTO> getTags(int offset, int limit) {
        Pageable pageable = PageRequest.of(offset,limit);
        return tagRepository.findAll(pageable)
                .stream()
                .map(tag -> new TagDTO(tag.getTagId(),tag.getName()))
                .toList();
    }
}
