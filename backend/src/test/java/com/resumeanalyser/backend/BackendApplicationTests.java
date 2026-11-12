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
import com.resumeanalyser.backend.model.Cv;
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

    @Test
    void cvMappingWritesAllMongoRequiredTopLevelFieldsIncludingNullTemplateId() {
        Instant now = Instant.parse("2026-11-03T08:00:00Z");
        Cv cv = new Cv();
        cv.setId(new ObjectId());
        cv.setCandidateId(new ObjectId());
        cv.setTemplateId(null);
        cv.setTitle("Candidate CV");
        cv.setSource(new Cv.Source("uploaded", "cv.pdf", "/tmp/cv.pdf", "application/pdf"));
        cv.setParseInfo(new Cv.ParseInfo("completed", now, "gemini-cv-v1"));
        cv.setPersonalInfo(Map.of(
                "fullName", "Candidate",
                "email", "candidate@example.com",
                "phone", "",
                "address", Map.of("city", "Hanoi", "country", "Vietnam")));
        cv.setSkills(List.of(new Cv.Skill("Java", "Backend", null, 3)));
        cv.setCreatedAt(now);
        cv.setUpdatedAt(now);

        Document document = new Document();
        converter.write(cv, document);

        assertTrue(document.containsKey("templateId"));
        assertNull(document.get("templateId"));
        assertInstanceOf(Document.class, document.get("personalInfo"));
        assertInstanceOf(List.class, document.get("skills"));
        Document parseInfo = (Document) document.get("parseInfo");
        assertEquals("completed", parseInfo.getString("status"));
        assertEquals("gemini-cv-v1", parseInfo.getString("parserVersion"));
        assertInstanceOf(Date.class, parseInfo.get("parsedAt"));
        assertInstanceOf(Date.class, document.get("createdAt"));
        assertInstanceOf(Date.class, document.get("updatedAt"));
    }

    @Test
    void templateCvMappingMatchesMongoStrictSchema() {
        Instant now = Instant.parse("2026-10-04T01:30:00Z");
        ObjectId templateId = new ObjectId();
        ObjectId gridFsFileId = new ObjectId();

        Cv cv = new Cv();
        cv.setId(new ObjectId());
        cv.setCandidateId(new ObjectId());
        cv.setTemplateId(templateId);
        cv.setTitle("CV Nguyen Van A - Fresher");
        cv.setSource(Cv.Source.template(gridFsFileId, "CV_Nguyen_Van_A_Fresher.pdf", "application/pdf"));
        cv.setParseInfo(new Cv.ParseInfo("pending", null, null));
        cv.setPersonalInfo(Map.of(
                "fullName", "Nguyen Van A",
                "email", "a@example.com",
                "address", Map.of("city", "Ha Noi")));
        cv.setLinks(List.of(new Cv.Link(null, "https://github.com/example")));
        Cv.Experience exp = new Cv.Experience();
        exp.setPosition("Intern");
        exp.setCompany("Company A");
        cv.setExperience(List.of(exp));
        Cv.Education edu = new Cv.Education();
        edu.setInstitution("University A");
        edu.setDegree("Bachelor");
        cv.setEducation(List.of(edu));
        cv.setSkills(List.of(new Cv.Skill("Java", null, null, null)));
        cv.setCreatedAt(now);
        cv.setUpdatedAt(now);

        Document document = new Document();
        converter.write(cv, document);

        assertEquals(templateId, document.getObjectId("templateId"));
        Document source = (Document) document.get("source");
        assertEquals("template", source.getString("type"));
        assertEquals(gridFsFileId, source.getObjectId("fileId"));
        assertFalse(source.containsKey("fileUrl"));
        Document parseInfo = (Document) document.get("parseInfo");
        assertEquals("pending", parseInfo.getString("status"));
        assertFalse(parseInfo.containsKey("parsedAt"));
        assertFalse(parseInfo.containsKey("parserVersion"));
        List<?> links = (List<?>) document.get("links");
        assertEquals(1, links.size());
        assertEquals("https://github.com/example", ((Document) links.getFirst()).getString("url"));
        assertFalse(((Document) links.getFirst()).containsKey("type"));
    }

}
