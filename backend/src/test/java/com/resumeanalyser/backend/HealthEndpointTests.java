package com.resumeanalyser.backend;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.mongodb.uri=mongodb://127.0.0.1:1/resume_analyser_test_health?serverSelectionTimeoutMS=100",
        "logging.level.root=ERROR" })
class HealthEndpointTests {
    @Value("${local.server.port}")
    int port;

    private HttpResponse<String> get(String path) throws Exception {
        return HttpClient.newHttpClient().send(HttpRequest.newBuilder(
                URI.create("http://127.0.0.1:" + port + path))
                .timeout(Duration.ofSeconds(10)).GET().build(), HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void publicHealthFailsWhenMongoIsUnavailableWithoutLeakingDetails() throws Exception {
        var response = get("/actuator/health");
        assertEquals(503, response.statusCode());
        var body = Document.parse(response.body());
        assertEquals("DOWN", body.getString("status"));
        assertFalse(body.containsKey("components"));
        assertFalse(body.containsKey("details"));
    }

    @Test
    void otherManagementEndpointsRemainProtected() throws Exception {
        assertEquals(401, get("/actuator/env").statusCode());
    }
}
