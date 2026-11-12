package com.resumeanalyser.backend.controller;

import static org.junit.jupiter.api.Assertions.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
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
        "jwt.secret=registration-integration-test-secret-at-least-32-bytes",
        "debug=false", "logging.level.root=WARN", "logging.level.org.springframework=WARN" })
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class RegistrationMongoIntegrationTests {
    private static final String DATABASE = "resume_analyser_test_reg_"
            + UUID.randomUUID().toString().replace("-", "");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        String uri = System.getenv("RESUME_TEST_MONGO_URI");
        if (uri == null || !uri.matches("mongodb://127\\.0\\.0\\.1:[0-9]+/resume_analyser_test")) {
            throw new IllegalStateException("Use a dedicated local MongoDB test URI");
        }
        registry.add("spring.mongodb.uri", () -> uri.replace("resume_analyser_test", DATABASE));
    }

    @Value("${local.server.port}") int port;
    @Autowired MongoTemplate mongo;
    @Autowired PasswordEncoder encoder;
    private final HttpClient http = HttpClient.newHttpClient();

    @AfterAll
    void cleanUp() {
        assertEquals(DATABASE, mongo.getDb().getName());
        mongo.getDb().drop();
    }

    private HttpResponse<String> post(String path, String body) throws Exception {
        return http.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/auth/" + path))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void candidateCanRegisterPersistProfileAndLogin() throws Exception {
        HttpResponse<String> response = post("register", """
                {"email":" WEB-CANDIDATE@example.com ","password":"secret123","role":"candidate",
                 "fullName":" Web Candidate ","phone":"0901234567","avatarUrl":"",
                 "location":{"address":"123 Test","district":"1","city":"HCM","country":"Việt Nam"}}
                """);
        assertEquals(201, response.statusCode(), response.body());
        Document data = Document.parse(response.body());
        ObjectId userId = new ObjectId(data.getString("id"));
        Document user = mongo.getCollection("users").find(new Document("_id", userId)).first();
        assertNotNull(user);
        assertEquals("web-candidate@example.com", user.getString("email"));
        assertTrue(encoder.matches("secret123", user.getString("passwordHash")));
        assertFalse(data.containsKey("passwordHash"));
        Document profile = mongo.getCollection("candidate_profiles").find(new Document("userId", userId)).first();
        assertNotNull(profile);
        assertEquals("Web Candidate", profile.getString("fullName"));
        assertEquals("HCM", profile.get("location", Document.class).getString("city"));
        HttpResponse<String> login = post("login", """
                {"email":"web-candidate@example.com","password":"secret123"}
                """);
        assertEquals(200, login.statusCode(), login.body());
        assertNotNull(Document.parse(login.body()).getString("token"));
        assertEquals("candidate", Document.parse(login.body()).getString("role"));
    }

    @Test
    void recruiterCanRegisterCompanyProfileAndLogin() throws Exception {
        HttpResponse<String> response = post("register", """
                {"email":"web-recruiter@example.com","password":"secret123","role":"recruiter",
                 "fullName":"Web Recruiter","phone":"0901234567",
                 "company":{"name":"Test Company","industry":"IT","logoUrl":"","description":"",
                 "size":"","website":"","locations":[{"address":"","city":"HCM","country":"Việt Nam"}]}}
                """);
        assertEquals(201, response.statusCode(), response.body());
        ObjectId userId = new ObjectId(Document.parse(response.body()).getString("id"));
        Document profile = mongo.getCollection("recruiter_profiles").find(new Document("userId", userId)).first();
        assertNotNull(profile);
        Document company = mongo.getCollection("companies").find(new Document("_id", profile.getObjectId("companyId"))).first();
        assertNotNull(company);
        assertEquals("Test Company", company.getString("name"));
        HttpResponse<String> login = post("login", """
                {"email":"web-recruiter@example.com","password":"secret123"}
                """);
        assertEquals(200, login.statusCode(), login.body());
        assertEquals("recruiter", Document.parse(login.body()).getString("role"));
    }

    @Test
    void duplicateEmailReturnsConflictWithoutExtraProfile() throws Exception {
        String payload = """
                {"email":"web-duplicate@example.com","password":"secret123","role":"candidate","fullName":"Duplicate"}
                """;
        assertEquals(201, post("register", payload).statusCode());
        assertEquals(409, post("register", payload).statusCode());
        assertEquals(1, mongo.getCollection("users").countDocuments(new Document("email", "web-duplicate@example.com")));
    }

    @Test
    void rejectsInvalidAccountAndRecruiterWithoutCompany() throws Exception {
        assertEquals(400, post("register", """
                {"email":"invalid","password":"123","fullName":"Test"}
                """).statusCode());
        assertEquals(400, post("register", """
                {"email":"web-missing-name@example.com","password":"secret123","role":"candidate"}
                """).statusCode());
        assertEquals(400, post("register", """
                {"email":"web-missing-company@example.com","password":"secret123","role":"recruiter","fullName":"Test"}
                """).statusCode());
        assertEquals(0, mongo.getCollection("users").countDocuments(new Document("email", "web-missing-company@example.com")));
    }
}
