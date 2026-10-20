package com.resumeanalyser.backend.exception;

public class UnsupportedFileTypeException extends RuntimeException {
    private final String code;

    public UnsupportedFileTypeException(String message) {
        super(message);
        this.code = "UNSUPPORTED_FILE_TYPE";
    }

    public UnsupportedFileTypeException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
