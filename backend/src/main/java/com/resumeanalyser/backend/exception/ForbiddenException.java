package com.resumeanalyser.backend.exception;

public class ForbiddenException extends RuntimeException {
    private final String code;

    public ForbiddenException(String message) {
        super(message);
        this.code = "FORBIDDEN";
    }

    public ForbiddenException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
