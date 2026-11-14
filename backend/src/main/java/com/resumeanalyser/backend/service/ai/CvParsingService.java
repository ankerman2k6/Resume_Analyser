package com.resumeanalyser.backend.service.ai;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.dto.ai.CvExtractionResult;
import com.resumeanalyser.backend.exception.ConflictException;
import com.resumeanalyser.backend.exception.FileStorageException;
import com.resumeanalyser.backend.exception.NotFoundException;
import com.resumeanalyser.backend.model.Cv;
import com.resumeanalyser.backend.repository.CvRepository;
import com.resumeanalyser.backend.service.ai.CvExtractionMapper.NormalizedCvData;

@Service
public class CvParsingService {

    public static final String PARSER_VERSION = "gemini-cv-v1";

    private final CvRepository cvRepository;
    private final MongoTemplate mongoTemplate;
    private final GeminiCvExtractionClient geminiClient;
    private final CvExtractionMapper mapper;

    public CvParsingService(
            CvRepository cvRepository,
            MongoTemplate mongoTemplate,
            GeminiCvExtractionClient geminiClient,
            CvExtractionMapper mapper) {
        this.cvRepository = cvRepository;
        this.mongoTemplate = mongoTemplate;
        this.geminiClient = geminiClient;
        this.mapper = mapper;
    }

    public Cv parseAndSave(ObjectId cvId, ObjectId candidateId) {
        if (cvId == null || candidateId == null) {
            throw new IllegalArgumentException("cvId và candidateId không được null.");
        }

        Cv cv = cvRepository.findByIdAndCandidateId(cvId, candidateId)
                .orElseThrow(() -> notFound());
        Query availableCv = Query.query(Criteria.where("_id").is(cvId)
                .and("candidateId").is(candidateId)
                .and("parseInfo.status").ne("processing"));

        Cv processing = mongoTemplate.findAndModify(
                availableCv,
                statusUpdate("processing", Instant.now()),
                FindAndModifyOptions.options().returnNew(true),
                Cv.class);
        if (processing == null) {
            throw new ConflictException(
                    "CV_PARSE_IN_PROGRESS", "CV đang được Gemini phân tích. Vui lòng chờ hoàn tất.");
        }

        Query processingCv = Query.query(Criteria.where("_id").is(cvId)
                .and("candidateId").is(candidateId)
                .and("parseInfo.status").is("processing"));

        try {
            Path pdfPath = resolvePdf(cv);
            CvExtractionResult extraction = geminiClient.extract(pdfPath);
            NormalizedCvData data = mapper.normalize(extraction);
            Instant now = Instant.now();
            Update update = new Update()
                    .set("skills", data.skills())
                    .set("experience", data.experience())
                    .set("education", data.education())
                    .set("certificates", data.certificates())
                    .set("parseInfo", new Cv.ParseInfo("completed", now, PARSER_VERSION))
                    .set("updatedAt", now);

            Cv updated = mongoTemplate.findAndModify(
                    processingCv,
                    update,
                    FindAndModifyOptions.options().returnNew(true),
                    Cv.class);
            if (updated == null) {
                throw notFound();
            }
            return updated;
        } catch (RuntimeException exception) {
            mongoTemplate.updateFirst(processingCv, statusUpdate("failed", Instant.now()), Cv.class);
            throw exception;
        }
    }

    private Path resolvePdf(Cv cv) {
        if (cv.getSource() == null || cv.getSource().getFileUrl() == null
                || cv.getSource().getFileUrl().isBlank()) {
            throw new FileStorageException("CV không có đường dẫn file PDF để phân tích.");
        }
        Path path = Path.of(cv.getSource().getFileUrl()).toAbsolutePath().normalize();
        if (!Files.isRegularFile(path)) {
            throw new FileStorageException("Không tìm thấy file PDF của CV để phân tích.");
        }
        return path;
    }

    private Update statusUpdate(String status, Instant now) {
        return new Update()
                .set("parseInfo", new Cv.ParseInfo(status, now, PARSER_VERSION))
                .set("updatedAt", now);
    }

    private NotFoundException notFound() {
        return new NotFoundException(
                "RESOURCE_NOT_FOUND", "Không tìm thấy CV hoặc CV không thuộc về ứng viên.");
    }
}
