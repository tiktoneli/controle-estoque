package com.brisa.controleEstoque.exceptions;

public class ResourceNotFoundException extends RuntimeException {

    private static final Long serialVersionUID = 1L;

    public ResourceNotFoundException(Long id, String element) {
        super("Unable to locate " + element + " with Id: " + id);
    }

    public ResourceNotFoundException(String mensagem) {
        super(mensagem);
    }
}