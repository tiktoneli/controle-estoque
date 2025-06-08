package com.brisa.controleEstoque.controller;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.validation.annotation.Validated;
import com.brisa.controleEstoque.dto.requests.RequestLocationDTO;
import com.brisa.controleEstoque.dto.responses.ResponseLocationDTO;
import com.brisa.controleEstoque.entity.Location;
import com.brisa.controleEstoque.mapper.LocationMapper;
import com.brisa.controleEstoque.service.LocationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Validated
@RequestMapping("/api/locations")
@Tag(name = "Locations", description = "APIs for managing storage locations in the inventory")
public class LocationController {

    private final LocationService locationService;
    private final LocationMapper locationMapper;

    public LocationController(LocationService locationService, LocationMapper locationMapper) {
        this.locationService = locationService;
        this.locationMapper = locationMapper;
    }

    @PostMapping
    @Operation(summary = "Create a new location", description = "Creates a new storage location in the inventory system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Location created successfully", content = @Content(schema = @Schema(implementation = ResponseLocationDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ResponseLocationDTO> create(@RequestBody RequestLocationDTO dto) {
        Location location = locationService.create(dto);
        return ResponseEntity.ok(locationMapper.toDto(location));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a location by ID", description = "Retrieves a specific storage location from the inventory by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Location found", content = @Content(schema = @Schema(implementation = ResponseLocationDTO.class))),
            @ApiResponse(responseCode = "404", description = "Location not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ResponseLocationDTO> findById(@PathVariable UUID id) {
        Location location = locationService.findById(id);
        return ResponseEntity.ok(locationMapper.toDto(location));
    }

    @GetMapping
    @Operation(summary = "Get all locations", description = "Retrieves a paginated list of all storage locations in the inventory")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Locations retrieved successfully", content = @Content(schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Page<ResponseLocationDTO>> findAll(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        Page<Location> locations = locationService.findAll(search, pageable);
        return ResponseEntity.ok(locations.map(locationMapper::toDto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a location", description = "Updates an existing storage location in the inventory system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Location updated successfully", content = @Content(schema = @Schema(implementation = ResponseLocationDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "Location not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ResponseLocationDTO> update(@PathVariable UUID id, @RequestBody RequestLocationDTO dto) {
        Location location = locationService.update(id, dto);
        return ResponseEntity.ok(locationMapper.toDto(location));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a location", description = "Removes a storage location from the inventory system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Location deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Location not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        locationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}