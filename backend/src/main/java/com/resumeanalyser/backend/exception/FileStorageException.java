package com.resumeanalyser.backend.exception;

public class FileStorageException extends RuntimeException {
    private final String code;

    public FileStorageException(String message) {
        super(message);
        this.code = "FILE_STORAGE_UNAVAILABLE";
    }

    public FileStorageException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
