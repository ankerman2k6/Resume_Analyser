package com.resumeanalyser.backend.controller;

import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.UserRepository;
import com.resumeanalyser.backend.security.JwtService;
import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.Duration;
import java.util.*;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.CollectionOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.validation.Validator;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.*;

// Opt-in: a dedicated local mongod, never the URI from application.properties.
@EnabledIfEnvironmentVariable(named = "RESUME_TEST_MONGO_URI", matches = ".+")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.mongodb.uri=mongodb://127.0.0.1:1/resume_analyser_test_disabled",
        "jwt.secret=application-integration-test-secret-at-least-32-bytes", "jwt.expiration=60000",
        "logging.level.root=WARN", "logging.level.org.springframework=INFO"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class HrApplicationsMongoIntegrationTests {
    private static String testUri() {
        String uri = System.getenv("RESUME_TEST_MONGO_URI");
        if (uri == null || !uri.matches("mongodb://127\\.0\\.0\\.1:[0-9]+/resume_analyser_test")) {
            throw new IllegalStateException("Use mongodb://127.0.0.1:<dedicated-port>/resume_analyser_test");
        }
        return uri + "_" + UUID.randomUUID().toString().replace("-", "");
    }

    @DynamicPropertySource
    static void mongoProperties(DynamicPropertyRegistry registry) {
        String isolatedUri = testUri();
        registry.add("spring.mongodb.uri", () -> isolatedUri);
    }

    @Value("${local.server.port}") int port;
    @Autowired MongoTemplate mongo;
    @Autowired UserRepository users;
    @Autowired JwtService jwt;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    User recruiter;
    ObjectId jobId, applicationId;
    Document original;
    String token;

    @BeforeAll void createValidatedCollection() throws Exception {
        assertTrue(mongo.getDb().getName().startsWith("resume_analyser_test_"));
        try (var input = getClass().getResourceAsStream("/applications-schema.json")) {
            assertNotNull(input);
            Document schema = Document.parse(new String(input.readAllBytes(), StandardCharsets.UTF_8));
            mongo.createCollection("applications", CollectionOptions.empty()
                    .validator(Validator.document(new Document("$jsonSchema", schema))));
        }
    }

    @BeforeEach void fixtures() {
        recruiter = new User();
        recruiter.setId(new ObjectId().toHexString());
        recruiter.setEmail("hr-" + recruiter.getId() + "@test.invalid");
        recruiter.setRole("recruiter");
        recruiter.setStatus("active");
        users.save(recruiter);
        token = jwt.generateToken(recruiter);
        jobId = new ObjectId();
        applicationId = new ObjectId();
        mongo.getCollection("jobs").insertOne(new Document("_id", jobId)
                .append("recruiterId", new ObjectId(recruiter.getId())).append("status", "active"));
        Date applied = Date.from(Instant.parse("2026-10-04T00:00:00Z"));
        original = new Document("_id", applicationId).append("jobId", jobId)
                .append("candidateId", new ObjectId()).append("cvId", new ObjectId())
                .append("status", "interview").append("appliedAt", applied).append("updatedAt", applied)
                .append("statusHistory", List.of(new Document("status", "applied").append("changedAt", applied)
                        .append("changedBy", new ObjectId()).append("note", "Keep this note")
                        .append("legacyExtra", "preserve unknown history fields")))
                .append("analysisResults", new Document("score", 87));
        mongo.getCollection("applications").insertOne(original);
    }

    @AfterAll void cleanupOnlyIsolatedDatabase() {
        String name = mongo.getDb().getName();
        if (!name.matches("resume_analyser_test_[a-f0-9]{32}")) {
            throw new IllegalStateException("Refusing to drop non-test database");
        }
        mongo.getDb().drop();
    }

    private HttpResponse<String> request(String method, String path, String bearer, String body) throws Exception {
        var builder = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                .timeout(Duration.ofSeconds(10)).header("Content-Type", "application/json");
        if (bearer != null) builder.header("Authorization", "Bearer " + bearer);
        return http.send(builder.method(method, body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
    }

    private String getPath(Object id) { return "/api/hr/jobs/" + id + "/applications"; }
    private String patchPath(Object id) { return "/api/hr/applications/" + id + "/status"; }
    private static final String SHORTLISTED = "{\"status\":\"shortlisted\"}";

    @Test void realHttpGetReadsLowercaseStatusAndBsonIds() throws Exception {
        var response = request("GET", getPath(jobId), token, null);
        assertEquals(200, response.statusCode(), response.body());
        var list = Document.parse("{\"data\":" + response.body() + "}").getList("data", Document.class);
        assertEquals(1, list.size());
        assertEquals(applicationId.toHexString(), list.getFirst().getString("id"));
        assertEquals("interview", list.getFirst().getString("status"));
        assertEquals(original.getObjectId("candidateId").toHexString(), list.getFirst().getString("candidateId"));
    }

    @Test void realHttpGetReturnsEmptyArrayForEmptyJob() throws Exception {
        ObjectId emptyJob = new ObjectId();
        mongo.getCollection("jobs").insertOne(new Document("_id", emptyJob)
                .append("recruiterId", new ObjectId(recruiter.getId())));
        var response = request("GET", getPath(emptyJob), token, null);
        assertEquals(200, response.statusCode(), response.body());
        assertEquals("[]", response.body());
    }

    @Test void realHttpPatchPreservesAllFieldsAndHistoryUnderMongoValidator() throws Exception {
        Instant before = Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MILLIS);
        var response = request("PATCH", patchPath(applicationId), token, SHORTLISTED);
        assertEquals(200, response.statusCode(), response.body());
        assertEquals("shortlisted", Document.parse(response.body()).getString("status"));
        Document saved = mongo.getCollection("applications").find(eq("_id", applicationId)).first();
        assertNotNull(saved);
        assertEquals("shortlisted", saved.getString("status"));
        assertFalse(saved.getDate("updatedAt").toInstant().isBefore(before));
        assertFalse(saved.getDate("updatedAt").toInstant().isAfter(Instant.now()));
        for (String field : List.of("_id", "jobId", "candidateId", "cvId", "appliedAt", "analysisResults")) {
            assertEquals(original.get(field), saved.get(field), field);
        }
        var history = saved.getList("statusHistory", Document.class);
        assertEquals(2, history.size());
        assertEquals(original.getList("statusHistory", Document.class).getFirst(), history.getFirst());
        assertEquals("shortlisted", history.getLast().getString("status"));
        assertEquals(new ObjectId(recruiter.getId()), history.getLast().getObjectId("changedBy"));
        assertEquals(saved.getDate("updatedAt"), history.getLast().getDate("changedAt"));
    }

    @Test void realHttpGetErrorsAre400404403401() throws Exception {
        assertEquals(400, request("GET", getPath("bad-id"), token, null).statusCode());
        assertEquals(404, request("GET", getPath(new ObjectId()), token, null).statusCode());
        ObjectId otherJob = new ObjectId();
        mongo.getCollection("jobs").insertOne(new Document("_id", otherJob).append("recruiterId", new ObjectId()));
        assertEquals(403, request("GET", getPath(otherJob), token, null).statusCode());
        assertEquals(401, request("GET", getPath(jobId), null, null).statusCode());
        assertEquals(401, request("GET", getPath(jobId), "invalid", null).statusCode());
    }

    @Test void realHttpPatchErrorsDoNotChangeDocument() throws Exception {
        assertEquals(400, request("PATCH", patchPath("bad-id"), token, SHORTLISTED).statusCode());
        assertEquals(404, request("PATCH", patchPath(new ObjectId()), token, SHORTLISTED).statusCode());
        assertEquals(400, request("PATCH", patchPath(applicationId), token, "{\"status\":\"invalid\"}").statusCode());
        assertEquals(401, request("PATCH", patchPath(applicationId), null, SHORTLISTED).statusCode());
        assertEquals(401, request("PATCH", patchPath(applicationId), "invalid", SHORTLISTED).statusCode());
        var otherRecruiter = new User();
        otherRecruiter.setId(new ObjectId().toHexString());
        otherRecruiter.setRole("recruiter");
        otherRecruiter.setStatus("active");
        users.save(otherRecruiter);
        assertEquals(403, request("PATCH", patchPath(applicationId), jwt.generateToken(otherRecruiter), SHORTLISTED).statusCode());
        assertEquals(original, mongo.getCollection("applications").find(eq("_id", applicationId)).first());
    }

    @Test void repeatedUpdatesAppendHistoryAndRetainEarlierEntries() throws Exception {
        for (String status : List.of("pending", "reviewing", "shortlisted", "interview", "accepted", "rejected")) {
            var response = request("PATCH", patchPath(applicationId), token, "{\"status\":\"" + status + "\"}");
            assertEquals(200, response.statusCode(), response.body());
        }
        Document saved = mongo.getCollection("applications").find(eq("_id", applicationId)).first();
        assertNotNull(saved);
        assertEquals("rejected", saved.getString("status"));
        var history = saved.getList("statusHistory", Document.class);
        assertEquals(7, history.size());
        assertEquals(original.getList("statusHistory", Document.class).getFirst(), history.getFirst());
        assertEquals(List.of("applied", "pending", "reviewing", "shortlisted", "interview", "accepted", "rejected"),
                history.stream().map(entry -> entry.getString("status")).toList());
    }
}
