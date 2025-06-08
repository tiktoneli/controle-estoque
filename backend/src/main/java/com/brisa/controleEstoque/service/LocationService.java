package com.brisa.controleEstoque.service;

import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brisa.controleEstoque.dto.requests.RequestLocationDTO;
import com.brisa.controleEstoque.entity.Location;
import com.brisa.controleEstoque.exceptions.ResourceBadRequestException;
import com.brisa.controleEstoque.exceptions.ResourceNotFoundException;
import com.brisa.controleEstoque.mapper.LocationMapper;
import com.brisa.controleEstoque.repository.LocationRepository;
import com.brisa.controleEstoque.repository.specification.LocationSpecification;

@Service
@Transactional
public class LocationService {
    private final LocationRepository locationRepository;
    private final LocationMapper locationMapper;
    private final LocationSpecification locationSpecification;

    public LocationService(LocationRepository locationRepository, LocationMapper locationMapper) {
        this.locationRepository = locationRepository;
        this.locationMapper = locationMapper;
        this.locationSpecification = new LocationSpecification();
    }

    public Page<Location> findAll(Pageable pageable) {
        return locationRepository.findAll(pageable);
    }

    public Location findById(UUID id) {
        return locationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));
    }

    public Location create(RequestLocationDTO dto) {
        try {
            Location location = locationMapper.toEntity(dto);
            return locationRepository.save(location);
        } catch (DataIntegrityViolationException e) {
            if (e.getMessage().contains("unique constraint")) {
                throw new ResourceBadRequestException("Location name has to be unique.");
            }
            if (e.getMessage().contains("not-null constraint")) {
                throw new ResourceBadRequestException("Location name not specified, must not be null.");
            }
            throw e;
        }
    }

    public Location update(UUID id, RequestLocationDTO dto) {
        Location existing = findById(id);
        try {
            locationMapper.updateEntityFromDto(dto, existing);
            return locationRepository.save(existing);
        } catch (DataIntegrityViolationException e) {
            if (e.getMessage().contains("unique constraint")) {
                throw new ResourceBadRequestException("Location name has to be unique.");
            }
            throw e;
        }
    }

    public void delete(UUID id) {
        if (!locationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Location not found with id: " + id);
        }
        locationRepository.deleteById(id);
    }

    public Page<Location> findAll(String search, Pageable pageable) {
        Specification<Location> spec = Specification.where(null);

        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and(locationSpecification.search(search));
        }

        return locationRepository.findAll(spec, pageable);
    }
}