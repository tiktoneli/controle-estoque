package com.brisa.controleEstoque.controller;

import com.brisa.controleEstoque.config.validation.OnCreate;
import com.brisa.controleEstoque.config.validation.OnUpdate;
import com.brisa.controleEstoque.dto.requests.RequestLotDTO;
import com.brisa.controleEstoque.dto.responses.ResponseLotDTO;
import com.brisa.controleEstoque.entity.Lot;
import com.brisa.controleEstoque.mapper.LotMapper;
import com.brisa.controleEstoque.service.LotService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@Validated
@RequestMapping("/api/lots")
@Tag(name = "Lots", description = "APIs for managing product lots in the inventory")
public class LotController {

    private final LotService service;
    private final LotMapper mapper;

    public LotController(LotService service, LotMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    @Operation(summary = "Create a new lot", description = "Creates a new product lot in the inventory system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Lot created successfully", content = @Content(schema = @Schema(implementation = ResponseLotDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ResponseLotDTO> create(@RequestBody @Validated(OnCreate.class) RequestLotDTO dto) {
        Lot lot = service.create(dto);
        return ResponseEntity.status(201).body(mapper.toDto(lot));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a lot by ID", description = "Retrieves a specific product lot from the inventory by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lot found", content = @Content(schema = @Schema(implementation = ResponseLotDTO.class))),
            @ApiResponse(responseCode = "404", description = "Lot not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ResponseLotDTO> findById(@PathVariable UUID id) {
        Lot lot = service.findById(id);
        return ResponseEntity.ok(mapper.toDto(lot));
    }

    @GetMapping
    @Operation(summary = "Get all lots", description = "Retrieves a paginated list of all product lots in the inventory")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lots retrieved successfully", content = @Content(schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Page<ResponseLotDTO>> findAll(
            @Parameter(description = "Search term for lot number") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by product ID") @RequestParam(required = false) UUID productId,
            @Parameter(description = "Filter by manufacturing date range start") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime manufacturingStartDate,
            @Parameter(description = "Filter by manufacturing date range end") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime manufacturingEndDate,
            @Parameter(description = "Filter by expiration date range start") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime expirationStartDate,
            @Parameter(description = "Filter by expiration date range end") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime expirationEndDate,
            Pageable pageable) {
        Page<Lot> lots = service.findAll(search, productId, manufacturingStartDate, manufacturingEndDate, 
            expirationStartDate, expirationEndDate, pageable);
        return ResponseEntity.ok(lots.map(mapper::toDto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a lot", description = "Updates an existing product lot in the inventory system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lot updated successfully", content = @Content(schema = @Schema(implementation = ResponseLotDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "Lot not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ResponseLotDTO> update(
            @PathVariable UUID id,
            @RequestBody @Validated(OnUpdate.class) RequestLotDTO dto) {
        Lot lot = service.update(id, dto);
        return ResponseEntity.ok(mapper.toDto(lot));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a lot", description = "Removes a product lot from the inventory system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Lot deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Lot not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
