package com.brisa.controleEstoque.controller;

import com.brisa.controleEstoque.config.validation.OnCreate;
import com.brisa.controleEstoque.config.validation.OnUpdate;
import com.brisa.controleEstoque.dto.requests.RequestTypeDTO;
import com.brisa.controleEstoque.dto.requests.RequestTypeAttributeDTO;
import com.brisa.controleEstoque.dto.responses.ResponseTypeDTO;
import com.brisa.controleEstoque.dto.responses.ResponseAttributeDTO;
import com.brisa.controleEstoque.entity.Type;
import com.brisa.controleEstoque.entity.TypeAttribute;
import com.brisa.controleEstoque.entity.Attribute;
import com.brisa.controleEstoque.exceptions.ResourceNotFoundException;
import com.brisa.controleEstoque.mapper.TypeMapper;
import com.brisa.controleEstoque.service.TypeService;
import com.brisa.controleEstoque.service.TypeAttributeService;
import com.brisa.controleEstoque.repository.AttributeRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/types")
@Tag(name = "Product Types", description = "APIs for managing product types and their attributes")
public class TypeController {

        private final TypeService typeService;
        private final TypeMapper typeMapper;
        private final TypeAttributeService typeAttributeService;

        public TypeController(TypeService typeService, TypeMapper typeMapper,
                        TypeAttributeService typeAttributeService) {
                this.typeService = typeService;
                this.typeMapper = typeMapper;
                this.typeAttributeService = typeAttributeService;
        }

        @PostMapping
        @Operation(summary = "Create a new product type", description = "Creates a new product type in the inventory system")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Product type created successfully", content = @Content(schema = @Schema(implementation = ResponseTypeDTO.class))),
                        @ApiResponse(responseCode = "400", description = "Invalid input data"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ResponseTypeDTO> create(@RequestBody @Validated(OnCreate.class) RequestTypeDTO dto) {
                Type type = typeService.create(dto);
                return ResponseEntity.status(201).body(typeMapper.toDto(type));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Get a product type by ID", description = "Retrieves a specific product type from the inventory by its ID")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Product type found", content = @Content(schema = @Schema(implementation = ResponseTypeDTO.class))),
                        @ApiResponse(responseCode = "404", description = "Product type not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ResponseTypeDTO> findById(@PathVariable UUID id) {
                Type type = typeService.findById(id);
                return ResponseEntity.ok(typeMapper.toDto(type));
        }

        @GetMapping
        @Operation(summary = "Get all product types", description = "Retrieves a paginated list of all product types in the inventory")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Product types retrieved successfully", content = @Content(schema = @Schema(implementation = Page.class))),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<Page<ResponseTypeDTO>> findAll(
                        @RequestParam(required = false) String search,
                        Pageable pageable) {
                Page<Type> types = typeService.findAll(search, pageable);
                return ResponseEntity.ok(types.map(typeMapper::toDto));
        }

        @PutMapping("/{id}")
        @Operation(summary = "Update a product type", description = "Updates an existing product type in the inventory system")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Product type updated successfully", content = @Content(schema = @Schema(implementation = ResponseTypeDTO.class))),
                        @ApiResponse(responseCode = "400", description = "Invalid input data"),
                        @ApiResponse(responseCode = "404", description = "Product type not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ResponseTypeDTO> update(
                        @PathVariable UUID id,
                        @RequestBody @Validated(OnUpdate.class) RequestTypeDTO dto) {
                Type type = typeService.update(id, dto);
                return ResponseEntity.ok(typeMapper.toDto(type));
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "Delete a product type", description = "Removes a product type from the inventory system")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Product type deleted successfully"),
                        @ApiResponse(responseCode = "404", description = "Product type not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<Void> delete(@PathVariable UUID id) {
                typeService.delete(id);
                return ResponseEntity.noContent().build();
        }

        @PostMapping("/{typeId}/attributes")
        @Operation(summary = "Add an attribute to a type", description = "Associates an existing attribute or creates a new one and links it to the type")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Attribute linked to type successfully", content = @Content(schema = @Schema(implementation = ResponseAttributeDTO.class))),
                        @ApiResponse(responseCode = "400", description = "Invalid input data"),
                        @ApiResponse(responseCode = "404", description = "Type or attribute not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ResponseAttributeDTO> addAttributeToType(
                        @Parameter(description = "ID of the type", required = true) @PathVariable UUID typeId,
                        @RequestBody @Validated RequestTypeAttributeDTO dto) {
                ResponseAttributeDTO response = typeAttributeService.addAttributeToType(typeId, dto);
                return ResponseEntity.status(201).body(response);
        }

        @GetMapping("/{typeId}/attributes")
        @Operation(summary = "List attributes for a type", description = "Returns all attributes linked to a type, including isRequired, defaultValue, and options.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Attributes retrieved successfully", content = @Content(schema = @Schema(implementation = ResponseAttributeDTO.class)))
        })
        public ResponseEntity<List<ResponseAttributeDTO>> getAttributesForType(
                        @Parameter(description = "ID of the type", required = true) @PathVariable UUID typeId) {
                return ResponseEntity.ok(typeAttributeService.getAttributesForType(typeId));
        }

        @DeleteMapping("/{typeId}/attributes/{attributeId}")
        @Operation(summary = "Remove attribute from type", description = "Removes the association between a type and an attribute. Does not delete the attribute itself.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Association removed successfully"),
                        @ApiResponse(responseCode = "404", description = "Type or attribute not found")
        })
        public ResponseEntity<Void> removeAttributeFromType(
                        @Parameter(description = "ID of the type", required = true) @PathVariable UUID typeId,
                        @Parameter(description = "ID of the attribute", required = true) @PathVariable UUID attributeId) {
                typeAttributeService.removeAttributeFromType(typeId, attributeId);
                return ResponseEntity.noContent().build();
        }

        @PutMapping("/{typeId}/attributes/{attributeId}")
        @Operation(summary = "Update type-attribute association settings", description = "Updates isRequired and/or defaultValue for the association. Only provided fields are updated.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Association updated successfully", content = @Content(schema = @Schema(implementation = ResponseAttributeDTO.class))),
                        @ApiResponse(responseCode = "404", description = "Type or attribute not found")
        })
        public ResponseEntity<ResponseAttributeDTO> updateTypeAttributeSettings(
                        @Parameter(description = "ID of the type", required = true) @PathVariable UUID typeId,
                        @Parameter(description = "ID of the attribute", required = true) @PathVariable UUID attributeId,
                        @RequestBody RequestTypeAttributeDTO dto) {
                ResponseAttributeDTO response = typeAttributeService.updateTypeAttributeSettings(typeId, attributeId,
                                dto);
                return ResponseEntity.ok(response);
        }
}