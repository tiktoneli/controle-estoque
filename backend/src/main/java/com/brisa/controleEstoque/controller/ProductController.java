package com.brisa.controleEstoque.controller;

import com.brisa.controleEstoque.config.validation.OnCreate;
import com.brisa.controleEstoque.config.validation.OnUpdate;
import com.brisa.controleEstoque.dto.requests.RequestProductDTO;
import com.brisa.controleEstoque.dto.responses.ResponseProductDTO;
import com.brisa.controleEstoque.entity.Product;
import com.brisa.controleEstoque.mapper.ProductMapper;
import com.brisa.controleEstoque.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "APIs for managing products in the inventory")
public class ProductController {
    private final ProductService productService;
    private final ProductMapper productMapper;

    public ProductController(ProductService productService, ProductMapper productMapper) {
        this.productService = productService;
        this.productMapper = productMapper;
    }

    @PostMapping
    @Operation(summary = "Create a new product", description = "Creates a new product in the inventory system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Product created successfully", content = @Content(schema = @Schema(implementation = ResponseProductDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ResponseProductDTO> create(@RequestBody @Validated(OnCreate.class) RequestProductDTO dto) {
        Product product = productService.create(dto);
        return ResponseEntity.status(201).body(productMapper.toDto(product));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a product by ID", description = "Retrieves a specific product from the inventory by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Product found", content = @Content(schema = @Schema(implementation = ResponseProductDTO.class))),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ResponseProductDTO> findById(@PathVariable UUID id) {
        Product product = productService.findById(id);
        return ResponseEntity.ok(productMapper.toDto(product));
    }

    @GetMapping
    @Operation(summary = "Get all products", description = "Retrieves a paginated list of all products in the inventory")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Products retrieved successfully", content = @Content(schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Page<ResponseProductDTO>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID typeId,
            Pageable pageable) {
        Page<Product> products = productService.findAll(search, typeId, pageable);
        return ResponseEntity.ok(products.map(productMapper::toDto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a product", description = "Updates an existing product in the inventory system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Product updated successfully", content = @Content(schema = @Schema(implementation = ResponseProductDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ResponseProductDTO> update(
            @PathVariable UUID id,
            @RequestBody @Validated(OnUpdate.class) RequestProductDTO dto) {
        Product product = productService.update(id, dto);
        return ResponseEntity.ok(productMapper.toDto(product));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a product", description = "Removes a product from the inventory system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Product deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}