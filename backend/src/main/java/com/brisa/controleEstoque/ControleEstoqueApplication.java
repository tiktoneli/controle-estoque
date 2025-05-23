package com.brisa.controleEstoque;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition(info = @Info(title = "Controle de Estoque", description = "API responsável pela gestão de produtos", version = "1"))
public class ControleEstoqueApplication {

	public static void main(String[] args) {
		SpringApplication.run(ControleEstoqueApplication.class, args);
	}

}
