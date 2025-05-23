package com.brisa.controleEstoque.exceptions;

public class ResourceBadRequestException extends RuntimeException {

    private static final Long serialVersionUID = 1L;

    public ResourceBadRequestException(String elemento, String mensagem) {
        super(mensagem + ", verifique o elemento: " + elemento);
    }

    public ResourceBadRequestException(String mensagem) {
        super(mensagem);
    }

    public ResourceBadRequestException() {
        super();
    }
}