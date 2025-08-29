package lk.ijse.gdse.service.impl;

import lk.ijse.gdse.entity.Boost;
import lk.ijse.gdse.repository.BoostRepository;
import lk.ijse.gdse.service.BoostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BoostServiceImpl implements BoostService {
    private final BoostRepository boostRepository;
    @Override
    public void deleteBoost(Long postId, String name) {
        Boost boost = boostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Boost not found"));
        if (!boost.getUser().getUsername().equals(name)) {
            throw new RuntimeException("Boost doesn't exist");
        }
        boostRepository.delete(boost);
    }
}
