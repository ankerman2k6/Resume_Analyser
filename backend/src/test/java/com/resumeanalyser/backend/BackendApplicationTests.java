package com.resumeanalyser.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.bson.Document;
import org.bson.types.ObjectId;
import java.time.LocalDateTime;
import java.util.Date;
import com.resumeanalyser.backend.model.User;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
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

}
