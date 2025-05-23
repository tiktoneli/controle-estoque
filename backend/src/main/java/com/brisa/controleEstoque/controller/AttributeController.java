package com.brisa.controleEstoque.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.brisa.controleEstoque.config.validation.OnCreate;
import com.brisa.controleEstoque.config.validation.OnUpdate;
import com.brisa.controleEstoque.dto.requests.RequestAttributeDTO;
import com.brisa.controleEstoque.dto.responses.ResponseAttributeDTO;
import com.brisa.controleEstoque.entity.Attribute;
import com.brisa.controleEstoque.mapper.AttributeMapper;
import com.brisa.controleEstoque.service.AttributeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

@RestController
@Validated
@RequestMapping("/api/attributes")
@Tag(name = "Attributes", description = "APIs for managing custom attributes in the inventory")
public class AttributeController {

    private final AttributeService service;
    private final AttributeMapper mapper;

    public AttributeController(AttributeService service, AttributeMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    @Operation(summary = "Create a new attribute", description = "Creates a new attribute in the inventory system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Attribute created successfully", content = @Content(schema = @Schema(implementation = ResponseAttributeDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ResponseAttributeDTO> create(
            @RequestBody @Validated(OnCreate.class) RequestAttributeDTO dto) {
        Attribute attribute = service.create(dto);
        return ResponseEntity.status(201).body(mapper.toDto(attribute));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an attribute by ID", description = "Retrieves a specific attribute from the inventory by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Attribute found", content = @Content(schema = @Schema(implementation = ResponseAttributeDTO.class))),
            @ApiResponse(responseCode = "404", description = "Attribute not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ResponseAttributeDTO> findById(@PathVariable UUID id) {
        Attribute attribute = service.findById(id);
        return ResponseEntity.ok(mapper.toDto(attribute));
    }

    @GetMapping
    @Operation(summary = "Get all attributes", description = "Retrieves a paginated list of all attributes in the inventory")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Attributes retrieved successfully", content = @Content(schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Page<ResponseAttributeDTO>> findAll(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        Page<Attribute> attributes = service.findAll(pageable);
        return ResponseEntity.ok(attributes.map(mapper::toDto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an attribute", description = "Updates an existing attribute in the inventory system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Attribute updated successfully", content = @Content(schema = @Schema(implementation = ResponseAttributeDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "Attribute not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ResponseAttributeDTO> update(
            @PathVariable UUID id,
            @RequestBody @Validated(OnUpdate.class) RequestAttributeDTO dto) {
        Attribute attribute = service.update(id, dto);
        return ResponseEntity.ok(mapper.toDto(attribute));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an attribute", description = "Removes a custom attribute from the inventory system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Attribute deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Attribute not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID of the attribute to delete", required = true) @PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}