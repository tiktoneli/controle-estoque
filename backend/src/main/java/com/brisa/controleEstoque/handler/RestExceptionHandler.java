package com.brisa.controleEstoque.handler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.brisa.controleEstoque.common.DateConverter;
import com.brisa.controleEstoque.exceptions.ResourceBadRequestException;
import com.brisa.controleEstoque.exceptions.ResourceInternalServerErrorException;
import com.brisa.controleEstoque.exceptions.ResourceNotFoundException;
import com.brisa.controleEstoque.entity.error.ErrorResponse;

@ControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlerResourceNotFoundException(ResourceNotFoundException ex) {

        String date = DateConverter.convertLocalDateTimeToString(LocalDateTime.now());

        ErrorResponse error = new ErrorResponse(404, "Not Found", ex.getMessage(), date);

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ResourceBadRequestException.class)
    public ResponseEntity<ErrorResponse> handlerResourceBadRequestException(ResourceBadRequestException ex) {

        String date = DateConverter.convertLocalDateTimeToString(LocalDateTime.now());

        ErrorResponse error = new ErrorResponse(400, "Bad Request", ex.getMessage(), date);

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResourceInternalServerErrorException.class)
    public ResponseEntity<ErrorResponse> handlerResourceInternalServerErrorException(
            ResourceInternalServerErrorException ex) {

        String date = DateConverter.convertLocalDateTimeToString(LocalDateTime.now());

        ErrorResponse error = new ErrorResponse(500, "Internal Server Error", ex.getMessage(), date);

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<ErrorResponse> handlerAccessDeniedException(IOException ex) {

        String date = DateConverter.convertLocalDateTimeToString(LocalDateTime.now());

        ErrorResponse error = new ErrorResponse(403, "Forbidden", ex.getMessage(), date);

        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handlerBadCredentialsException(Exception ex) {

        String date = DateConverter.convertLocalDateTimeToString(LocalDateTime.now());

        ErrorResponse error = new ErrorResponse(401, "Unauthorized", "The username or password is incorrect",
                date);

        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    // exception jakarta validate
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        throw new ResourceBadRequestException(message);
    }
}
