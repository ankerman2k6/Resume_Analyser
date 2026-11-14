package com.resumeanalyser.backend.exception;

public class PayloadTooLargeException extends RuntimeException {
    private final String code;

    public PayloadTooLargeException(String message) {
        super(message);
        this.code = "FILE_TOO_LARGE";
    }

    public PayloadTooLargeException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
