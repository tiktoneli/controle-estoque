//package com.brisa.controleEstoque.security;
//
//import com.auth0.jwt.JWT;
//import com.auth0.jwt.algorithms.Algorithm;
//import com.auth0.jwt.exceptions.JWTVerificationException;
//import com.auth0.jwt.interfaces.DecodedJWT;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//
//@Service
//public class JWTProvider {
//
//    @Value("${security.token.secret}")
//    private String secretKey;
//
//    public DecodedJWT validate(String token) {
//        token = token.replace("Bearer ", "");
//
//        Algorithm algorithm = Algorithm.HMAC256(secretKey);
//
//        try {
//            return JWT.require(algorithm)
//                    .build()
//                    .verify(token);
//        } catch (JWTVerificationException e) {
//            return null;
//        }
//    }
//}
