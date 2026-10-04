package com.resumeanalyser.backend.security;


import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.security.Keys;

@Service 
public class JwtService {
    
    private final SecretKey key;
    private final JwtParser parser;
    private final long expiration;
    
    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration) {

        this.key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        this.expiration = expiration;
        this.parser = Jwts.parser().verifyWith(key).build();
    }

    public String generateToken(User user) {

        return Jwts.builder()
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
    }

     // Đọc toàn bộ claims
    private Claims extractAllClaims(String token) {

        return parser
                .parseSignedClaims(token)
                .getPayload();
    }

    // Lấy email từ JWT
    public String extractEmail(String token) {
        return extractAllClaims(token).get("email", String.class);
    }

    // Lấy userId
    public String extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        if (claims.getExpiration() == null || !claims.getExpiration().after(new Date())
                || claims.getSubject() == null || claims.getSubject().isBlank()) {
            throw new JwtException("Token requires a valid subject and expiration");
        }
        return claims.getSubject();
    }

    // Lấy role
    public String extractRole(String token) {
        return extractAllClaims(token)
                .get("role", String.class);
    }

    // Kiểm tra JWT hợp lệ
    public boolean isTokenValid(String token) {
        try {
            extractUserId(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}

