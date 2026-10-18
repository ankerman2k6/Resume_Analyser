package com.resumeanalyser.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.bson.Document;
import org.bson.types.ObjectId;
import java.time.LocalDateTime;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import com.resumeanalyser.backend.model.Job;
import com.resumeanalyser.backend.model.User;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
        "spring.mongodb.uri=mongodb://127.0.0.1:1/resume_analyser_test_mapping?serverSelectionTimeoutMS=100",
        "jwt.secret=mapping-test-only-secret-at-least-32-bytes" })
class BackendApplicationTests {

    @Autowired
    MappingMongoConverter converter;

	@Test
	void contextLoads() {
	}

    @Test
    void bootConverterWritesUserWithoutClassAndKeepsDateConversions() {
        User user = new User();
        user.setId(new ObjectId().toHexString());
        user.setEmail("mapping@example.com");
        user.setPasswordHash("encoded-password");
        user.setRole("candidate");
        user.setStatus("active");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(user.getCreatedAt());
        Document document = new Document();
        converter.write(user, document);
        assertFalse(document.containsKey("_class"));
        assertInstanceOf(ObjectId.class, document.get("_id"));
        assertInstanceOf(Date.class, document.get("createdAt"));
        assertInstanceOf(Date.class, document.get("updatedAt"));
        assertEquals(user.getEmail(), converter.read(User.class, document).getEmail());
    }

    @Test
    void jobMappingKeepsObjectIdReferencesDatesAndAllRequirementFields() {
        Job job = new Job();
        job.setId(new ObjectId());
        job.setCompanyId(new ObjectId());
        job.setRecruiterId(new ObjectId());
        job.setDeadline(Instant.parse("2030-01-01T00:00:00Z"));
        job.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        job.setUpdatedAt(job.getCreatedAt());
        job.setRequirements(Map.of("requiredSkills", List.of("Java"),
                "preferredSkills", List.of("Spring"),
                "education", Map.of("minimumDegree", "bachelor"),
                "minimumGpa", Map.of("value", 3, "scale", 4),
                "languages", List.of(Map.of("name", "English"))));
        job.setLocation(new Job.Location("Address", "City", "Country", null));
        job.setSalary(new Job.Salary(100L, 200L, "USD", null));

        Document document = new Document();
        converter.write(job, document);
        assertEquals(job.getId(), document.getObjectId("_id"));
        assertEquals(job.getCompanyId(), document.getObjectId("companyId"));
        assertEquals(job.getRecruiterId(), document.getObjectId("recruiterId"));
        assertEquals(Date.from(job.getDeadline()), document.getDate("deadline"));
        assertEquals(Date.from(job.getCreatedAt()), document.getDate("createdAt"));
        assertEquals(Date.from(job.getUpdatedAt()), document.getDate("updatedAt"));
        assertFalse(document.containsKey("_class"));
        Job restored = converter.read(Job.class, document);
        assertEquals(job.getRequirements(), restored.getRequirements());
        assertNull(restored.getLocation().getRemote());
        assertNull(restored.getSalary().getNegotiable());
    }

}
