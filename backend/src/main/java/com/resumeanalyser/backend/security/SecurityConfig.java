package com.resumeanalyser.backend.security;

import java.util.UUID;

import org.springframework.context.annotation.Bean;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import jakarta.servlet.DispatcherType;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // JWT filter chỉ chạy trong Spring Security, không đăng ký thêm ở servlet container.
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration() {
        FilterRegistrationBean<JwtAuthenticationFilter> registration =
                new FilterRegistrationBean<>(jwtAuthenticationFilter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                // REST API dùng JWT nên tắt CSRF
                .csrf(csrf -> csrf.disable())

                // Không dùng session để lưu đăng nhập
                .sessionManagement(session -> session.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS))

                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            String requestId = UUID.randomUUID().toString();
                            response.getWriter().write(
                                    "{\"code\":\"UNAUTHENTICATED\",\"message\":\"Unauthorized\",\"errors\":{},\"requestId\":\""
                                            + requestId + "\",\"status\":401}");
                        })
                        .accessDeniedHandler((request, response, exception) -> {
                            response.setStatus(403);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            String requestId = UUID.randomUUID().toString();
                            response.getWriter().write(
                                    "{\"code\":\"FORBIDDEN\",\"message\":\"Forbidden\",\"errors\":{},\"requestId\":\""
                                            + requestId + "\",\"status\":403}");
                        }))

                .authorizeHttpRequests(auth -> auth
                        // Không để security che lỗi gốc của controller thành 401/403.
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/login",
                                "/api/auth/register")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/jobs/**",
                                "/api/companies/**",
                                "/api/cv-templates",
                                "/api/cv-templates/**")
                        .permitAll()
                        .requestMatchers("/api/hr/**").hasRole("RECRUITER")
                        .requestMatchers(HttpMethod.GET, "/company/**").permitAll()
                        .anyRequest().authenticated())

                // Cho JWT filter chạy trước filter login mặc định
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
