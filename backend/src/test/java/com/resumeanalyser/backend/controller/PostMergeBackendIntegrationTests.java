package com.resumeanalyser.backend.controller;

import static org.junit.jupiter.api.Assertions.*;

import com.resumeanalyser.backend.model.Job;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.JobRepository;
import com.resumeanalyser.backend.repository.UserRepository;
import com.resumeanalyser.backend.security.JwtService;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@EnabledIfEnvironmentVariable(named = "RESUME_TEST_MONGO_URI", matches = ".+")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.mongodb.uri=mongodb://127.0.0.1:1/resume_analyser_test_disabled",
        "jwt.secret=post-merge-integration-test-secret-at-least-32-bytes",
        "jwt.expiration=60000", "logging.level.root=WARN" })
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PostMergeBackendIntegrationTests {
    private static final Path UPLOADS = createUploadDirectory();
    private static final String DATABASE = "resume_analyser_test_" + UUID.randomUUID().toString().replace("-", "");
    private static final byte[] PDF = "%PDF-1.4\nTest CV content\n%%EOF".getBytes(StandardCharsets.UTF_8);

    private static Path createUploadDirectory() {
        try {
            return Files.createTempDirectory("resume-analyser-merge-").toAbsolutePath().normalize();
        } catch (IOException ex) {
            throw new IllegalStateException(ex);
        }
    }

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        String uri = System.getenv("RESUME_TEST_MONGO_URI");
        if (uri == null || !uri.matches("mongodb://127\\.0\\.0\\.1:[0-9]+/resume_analyser_test")) {
            throw new IllegalStateException("Use a dedicated local MongoDB: mongodb://127.0.0.1:<port>/resume_analyser_test");
        }
        registry.add("spring.mongodb.uri", () -> uri.replace("resume_analyser_test", DATABASE));
        registry.add("app.upload.dir", UPLOADS::toString);
    }

    @Value("${local.server.port}") int port;
    @Autowired MongoTemplate mongo;
    @Autowired JobRepository jobs;
    @Autowired UserRepository users;
    @Autowired JwtService jwt;
    @Autowired PasswordEncoder encoder;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private User recruiter, otherRecruiter, candidate;
    private Job published, draft, otherPublished;
    private ObjectId applicationId;
    private String hrToken, otherToken, candidateToken;

    private void assertIsolatedDatabase() {
        assertEquals(DATABASE, mongo.getDb().getName());
        assertTrue(DATABASE.matches("resume_analyser_test_[a-f0-9]{32}"));
    }

    @BeforeEach
    void fixtures() {
        assertIsolatedDatabase();
        for (String collection : mongo.getCollectionNames()) {
            mongo.getCollection(collection).deleteMany(new Document());
        }
        recruiter = user("recruiter", "hr@test.invalid");
        otherRecruiter = user("recruiter", "other@test.invalid");
        candidate = user("candidate", "candidate@test.invalid");
        hrToken = jwt.generateToken(recruiter);
        otherToken = jwt.generateToken(otherRecruiter);
        candidateToken = jwt.generateToken(candidate);
        published = job(recruiter, "Java Backend", "published", "HCMC", false, Instant.parse("2026-01-01T00:00:00Z"));
        draft = job(recruiter, "Java Draft", "draft", "HCMC", false, Instant.parse("2026-01-02T00:00:00Z"));
        otherPublished = job(otherRecruiter, "Python Data", "published", "Hanoi", true, Instant.parse("2026-01-03T00:00:00Z"));
        applicationId = new ObjectId();
        ObjectId otherApplication = new ObjectId();
        mongo.getCollection("applications").insertMany(List.of(
                new Document("_id", applicationId).append("jobId", published.getId())
                        .append("candidateId", new ObjectId(candidate.getId())).append("status", "pending"),
                new Document("_id", otherApplication).append("jobId", otherPublished.getId()).append("status", "accepted")));
        mongo.getCollection("interviews").insertMany(List.of(
                new Document("_id", new ObjectId()).append("applicationId", applicationId)
                        .append("scheduledBy", new ObjectId(recruiter.getId())).append("status", "scheduled")
                        .append("scheduledAt", Date.from(Instant.now().plusSeconds(86400))),
                new Document("_id", new ObjectId()).append("applicationId", otherApplication)
                        .append("scheduledBy", new ObjectId(recruiter.getId())).append("status", "completed")));
    }

    private User user(String role, String email) {
        User user = new User();
        user.setId(new ObjectId().toHexString());
        user.setRole(role);
        user.setEmail(email);
        user.setStatus("active");
        user.setPasswordHash(encoder.encode("test-password"));
        return users.save(user);
    }

    private Job job(User owner, String title, String status, String city, boolean remote, Instant createdAt) {
        Job job = new Job();
        job.setCompanyId(new ObjectId());
        job.setRecruiterId(new ObjectId(owner.getId()));
        job.setTitle(title);
        job.setDescription(title + " development");
        job.setCategory("IT");
        job.setEmploymentType("full_time");
        job.setLocation(new Job.Location("Address", city, "Vietnam", remote));
        job.setRequirements(Map.of("requiredSkills", List.of(title.split(" ")[0]),
                "education", Map.of("minimumDegree", "bachelor"),
                "minimumGpa", Map.of("value", 3, "scale", 4),
                "languages", List.of(Map.of("name", "English"))));
        job.setStatus(status);
        job.setCreatedAt(createdAt);
        job.setUpdatedAt(createdAt);
        job.setDeadline(Instant.now().plusSeconds(86400));
        return jobs.save(job);
    }

    private HttpResponse<String> request(String method, String path, String token, String body) throws Exception {
        var builder = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                .timeout(Duration.ofSeconds(15)).header("Content-Type", "application/json");
        if (token != null) builder.header("Authorization", "Bearer " + token);
        return http.send(builder.method(method, body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
    }

    private Document ok(HttpResponse<String> response, int expectedStatus) {
        assertEquals(expectedStatus, response.statusCode(), response.body());
        return Document.parse(response.body());
    }

    @Test
    void publicSearchFiltersPaginatesSortsAndEscapesPatterns() throws Exception {
        Document result = ok(request("GET", "/api/jobs/search?keyword=java&profession=it&location=hcmc&page=0&size=1", null, null), 200);
        assertEquals(1, ((Number) result.get("totalElements")).intValue());
        assertEquals(published.getId().toHexString(), result.getList("content", Document.class).getFirst().getString("id"));
        assertTrue(result.getBoolean("last"));
        Document first = ok(request("GET", "/api/jobs/search?page=0&size=1", null, null), 200);
        assertEquals(2, ((Number) first.get("totalElements")).intValue());
        assertEquals(otherPublished.getId().toHexString(), first.getList("content", Document.class).getFirst().getString("id"));
        assertFalse(first.getBoolean("last"));
        Document second = ok(request("GET", "/api/jobs/search?page=1&size=1", null, null), 200);
        assertEquals(published.getId().toHexString(), second.getList("content", Document.class).getFirst().getString("id"));
        Document remote = ok(request("GET", "/api/jobs/search?location=remote", null, null), 200);
        assertEquals(1, remote.getList("content", Document.class).size());
        Document literal = ok(request("GET", "/api/jobs/search?keyword=.%2A", null, null), 200);
        assertTrue(literal.getList("content", Document.class).isEmpty());
        Document normalized = ok(request("GET", "/api/jobs/search?page=-1&size=0", null, null), 200);
        assertEquals(0, normalized.getInteger("page"));
        assertEquals(10, normalized.getInteger("size"));
    }

    @Test
    void publicDetailsHideDraftWhileHrKeepsOwnershipAndRichRequirements() throws Exception {
        Document detail = ok(request("GET", "/api/jobs/" + published.getId(), null, null), 200);
        assertEquals(published.getCompanyId().toHexString(), detail.getString("companyId"));
        assertEquals("bachelor", detail.get("requirements", Document.class).get("education", Document.class).getString("minimumDegree"));
        ok(request("GET", "/api/jobs/" + draft.getId(), null, null), 400);
        ok(request("GET", "/api/jobs/invalid-id", null, null), 400);
        Document owned = ok(request("GET", "/api/hr/jobs/" + draft.getId(), hrToken, null), 200);
        assertEquals("draft", owned.getString("status"));
        assertEquals(404, request("GET", "/api/hr/jobs/" + draft.getId(), otherToken, null).statusCode());
        assertEquals(403, request("GET", "/api/hr/jobs", candidateToken, null).statusCode());
        assertEquals(401, request("GET", "/api/hr/jobs", null, null).statusCode());
    }

    private String jobBody(String title, String requirements) {
        return new Document("companyId", new ObjectId().toHexString()).append("title", title)
                .append("description", "Job description").append("category", "IT")
                .append("employmentType", "full_time").append("deadline", Instant.now().plusSeconds(86400).toString())
                .append("requirements", Document.parse(requirements)).toJson();
    }

    @Test
    void hrCrudPreservesReferencesAndRejectsInvalidRequirementUpdates() throws Exception {
        Document created = ok(request("POST", "/api/hr/jobs", hrToken, jobBody("New job", "{\"requiredSkills\":[\"Java\"]}")), 201);
        String id = created.getString("id");
        assertEquals("draft", created.getString("status"));
        assertEquals(recruiter.getId(), created.getString("recruiterId"));
        Document invalid = ok(request("PUT", "/api/hr/jobs/" + id, hrToken,
                jobBody("Invalid update", "{\"education\":\"invalid\"}")), 400);
        assertEquals(400, invalid.getInteger("status"));
        assertEquals("New job", jobs.findById(new ObjectId(id)).orElseThrow().getTitle());
        Document updated = ok(request("PUT", "/api/hr/jobs/" + id, hrToken,
                jobBody("Updated job", "{\"requiredSkills\":[\"Spring\"]}")), 200);
        assertEquals(created.getString("companyId"), updated.getString("companyId"));
        assertEquals(created.getString("recruiterId"), updated.getString("recruiterId"));
        assertEquals(Instant.parse(created.getString("createdAt")).truncatedTo(ChronoUnit.MILLIS),
                Instant.parse(updated.getString("createdAt")));
        assertEquals("draft", updated.getString("status"));
        ok(request("PATCH", "/api/hr/jobs/" + id + "/status", hrToken, "{\"status\":\"published\"}"), 200);
        ok(request("GET", "/api/jobs/" + id, null, null), 200);
        assertEquals(404, request("DELETE", "/api/hr/jobs/" + id, otherToken, null).statusCode());
        assertEquals(204, request("DELETE", "/api/hr/jobs/" + id, hrToken, null).statusCode());
        assertTrue(jobs.findById(new ObjectId(id)).isEmpty());
    }

    @Test
    void dashboardAggregatesOnlyOwnedJobsApplicationsAndInterviews() throws Exception {
        Document overview = ok(request("GET", "/api/hr/dashboard/overview", hrToken, null), 200);
        for (String field : List.of("publishedJobs", "draftJobs", "totalApplications", "totalInterviews", "scheduledInterviews")) {
            assertEquals(1, ((Number) overview.get(field)).intValue(), field);
        }
        assertEquals(2, ((Number) overview.get("totalJobs")).intValue());
        assertEquals(0, ((Number) overview.get("completedInterviews")).intValue());
        Document applications = ok(request("GET", "/api/hr/dashboard/applications/stats", hrToken, null), 200);
        assertEquals(1, applications.get("byStatus", Document.class).getInteger("pending"));
        Document interviews = ok(request("GET", "/api/hr/dashboard/interviews/stats", hrToken, null), 200);
        assertEquals(1, interviews.get("byStatus", Document.class).getInteger("scheduled"));
        assertEquals(403, request("GET", "/api/hr/dashboard/overview", candidateToken, null).statusCode());
    }

    private HttpResponse<String> upload(String token, String filename, String type, byte[] content) throws Exception {
        String boundary = "resume-test-" + UUID.randomUUID();
        byte[] start = ("--" + boundary + "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"" + filename
                + "\"\r\nContent-Type: " + type + "\r\n\r\n").getBytes(StandardCharsets.UTF_8);
        byte[] end = ("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8);
        var builder = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/api/resumes/upload"))
                .timeout(Duration.ofSeconds(20)).header("Content-Type", "multipart/form-data; boundary=" + boundary);
        if (token != null) builder.header("Authorization", "Bearer " + token);
        return http.send(builder.POST(HttpRequest.BodyPublishers.ofByteArrays(List.of(start, content, end))).build(),
                HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void cvUploadPersistsBytesAndMetadataWithoutExposingStorageOrOtherUsersFiles() throws Exception {
        assertEquals(401, upload(null, "cv.pdf", "application/pdf", PDF).statusCode());
        Document response = ok(upload(candidateToken, "../../cv.pdf", "application/pdf", PDF), 201);
        assertFalse(response.containsKey("filePath"));
        Document saved = mongo.getCollection("resumes").find(new Document("_id", new ObjectId(response.getString("id")))).first();
        assertNotNull(saved);
        assertEquals(candidate.getId(), saved.getString("userId"));
        Path stored = Path.of(saved.getString("filePath")).toAbsolutePath().normalize();
        assertEquals(UPLOADS, stored.getParent());
        assertArrayEquals(PDF, Files.readAllBytes(stored));
        ok(request("GET", "/api/resumes/" + response.getString("id"), candidateToken, null), 200);
        ok(request("GET", "/api/resumes/" + response.getString("id"), otherToken, null), 400);
        var mine = request("GET", "/api/resumes", candidateToken, null);
        assertEquals(200, mine.statusCode());
        assertEquals(1, Document.parse("{\"files\":" + mine.body() + "}").getList("files", Document.class).size());
        assertEquals("[]", request("GET", "/api/resumes", otherToken, null).body());
    }

    @Test
    void cvUploadEnforcesTypeSignatureAndFiveMegabyteFileLimit() throws Exception {
        ok(upload(candidateToken, "cv.docx", "application/pdf", PDF), 400);
        ok(upload(candidateToken, "cv.pdf", "text/plain", PDF), 400);
        ok(upload(candidateToken, "cv.pdf", "application/pdf", "not PDF".getBytes(StandardCharsets.UTF_8)), 400);
        ok(upload(candidateToken, "cv.pdf", "application/pdf", new byte[0]), 400);
        byte[] limit = Arrays.copyOf(PDF, 5 * 1024 * 1024);
        ok(upload(candidateToken, "limit.pdf", "application/pdf", limit), 201);
        ok(upload(candidateToken, "oversize.pdf", "application/pdf", Arrays.copyOf(limit, limit.length + 1)), 400);
        assertEquals(1, mongo.getCollection("resumes").countDocuments());
    }

    @Test
    void realLoginAndInterviewLifecyclePreserveAuthenticationAndOwnership() throws Exception {
        Document login = ok(request("POST", "/api/auth/login", null,
                "{\"email\":\"candidate@test.invalid\",\"password\":\"test-password\"}"), 200);
        Document me = ok(request("GET", "/api/auth/me", login.getString("token"), null), 200);
        assertEquals(candidate.getId(), me.getString("id"));
        assertFalse(me.containsKey("passwordHash"));
        assertEquals(401, request("GET", "/api/auth/me", "invalid", null).statusCode());
        String schedule = new Document("applicationId", applicationId.toHexString())
                .append("scheduledAt", Instant.now().plusSeconds(86400).toString()).append("durationMinutes", 60)
                .append("mode", "online").append("meetingLink", "https://example.test/meeting").toJson();
        Document interview = ok(request("POST", "/api/hr/interviews", hrToken, schedule), 201);
        String path = "/api/hr/interviews/" + interview.getString("id");
        ok(request("GET", path, hrToken, null), 200);
        assertEquals(404, request("GET", path, otherToken, null).statusCode());
        ok(request("PATCH", path + "/status", hrToken, "{\"status\":\"completed\"}"), 200);
        assertEquals(409, request("PATCH", path + "/status", hrToken, "{\"status\":\"scheduled\"}").statusCode());
    }

    @AfterAll
    void cleanupOnlyTestResources() throws IOException {
        assertIsolatedDatabase();
        mongo.getDb().drop();
        Path tempRoot = Path.of(System.getProperty("java.io.tmpdir")).toAbsolutePath().normalize();
        assertEquals(tempRoot, UPLOADS.getParent());
        assertTrue(UPLOADS.getFileName().toString().startsWith("resume-analyser-merge-"));
        try (var files = Files.list(UPLOADS)) {
            for (Path file : files.toList()) Files.deleteIfExists(file);
        }
        Files.deleteIfExists(UPLOADS);
    }
}
