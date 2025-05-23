package com.brisa.controleEstoque.exceptions;

public class ResourceInternalServerErrorException extends RuntimeException {

    private static final Long serialVersionUID = 1L;

    public ResourceInternalServerErrorException() {
        super("Um problema ocorreu durante a execução, tente novamente mais tarde.");
    }

    public ResourceInternalServerErrorException(String mensagem) {
        super(mensagem);
    }
}