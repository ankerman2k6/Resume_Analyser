package com.resumeanalyser.backend.dto;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

public record ApiErrorResponse(
        String code,
        String message,
        Map<String, String> errors,
        String requestId,
        int status
) {
    public ApiErrorResponse(String code, String message, int status) {
        this(code, message, Collections.emptyMap(), UUID.randomUUID().toString(), status);
    }

    public ApiErrorResponse(String code, String message, Map<String, String> errors, int status) {
        this(code, message, errors != null ? errors : Collections.emptyMap(), UUID.randomUUID().toString(), status);
    }

    public ApiErrorResponse(String code, String message) {
        this(code, message, Collections.emptyMap(), UUID.randomUUID().toString(), 400);
    }
}
