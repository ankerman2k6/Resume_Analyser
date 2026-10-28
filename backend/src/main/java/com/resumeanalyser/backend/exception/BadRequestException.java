package com.resumeanalyser.backend.exception;

public class BadRequestException extends RuntimeException {
    private final String code;

    public BadRequestException(String message) {
        super(message);
        this.code = "VALIDATION_ERROR";
    }

    public BadRequestException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
