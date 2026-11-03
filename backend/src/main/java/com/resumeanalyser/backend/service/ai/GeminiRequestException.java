package com.resumeanalyser.backend.service.ai;

public class GeminiRequestException extends RuntimeException {

    private final int statusCode;

    public GeminiRequestException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public GeminiRequestException(String message, int statusCode, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
