package com.resumeanalyser.backend.config;

import java.net.URI;
import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.gemini")
public class GeminiProperties {

    private String apiKey = "";
    private String model = "gemini-3.5-flash-lite";
    private URI baseUrl = URI.create("https://generativelanguage.googleapis.com/v1beta/");
    private Duration timeout = Duration.ofSeconds(90);

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public URI getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(URI baseUrl) {
        this.baseUrl = baseUrl;
    }

    public Duration getTimeout() {
        return timeout;
    }

    public void setTimeout(Duration timeout) {
        this.timeout = timeout;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }
}
