package com.resumeanalyser.backend.exception;

public class NotFoundException extends RuntimeException {
    private final String code;

    public NotFoundException(String message) {
        super(message);
        this.code = "RESOURCE_NOT_FOUND";
    }

    public NotFoundException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
