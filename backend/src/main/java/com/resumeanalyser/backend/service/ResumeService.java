package com.resumeanalyser.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.resumeanalyser.backend.dto.ResumeResponse;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.model.Resume;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.ResumeRepository;

@Service
public class ResumeService {

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    private final ResumeRepository resumeRepository;
    private final Path uploadStorageLocation;

    public ResumeService(
            ResumeRepository resumeRepository,
            @Value("${app.upload.dir:uploads/resumes}") String uploadDir) {
        this.resumeRepository = resumeRepository;
        this.uploadStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.uploadStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Không thể khởi tạo thư mục lưu trữ file: " + uploadDir, ex);
        }
    }

    public ResumeResponse uploadResume(MultipartFile file, User user) {
        validatePdfFile(file);

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown.pdf"
        );
        String uniqueFileName = UUID.randomUUID().toString() + ".pdf";
        Path targetLocation = this.uploadStorageLocation.resolve(uniqueFileName);

        try {
            // Lưu file vật lý vào thư mục lưu trữ
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            deleteFailedUpload(targetLocation, ex);
            throw new RuntimeException("Không thể lưu trữ file CV: " + ex.getMessage(), ex);
        }

        // Lưu thông tin metadata vào MongoDB
        Resume resume = new Resume(
                user.getId(),
                uniqueFileName,
                originalFilename,
                targetLocation.toString(),
                file.getSize(),
                "application/pdf",
                "UPLOADED"
        );
        resume.setUploadedAt(LocalDateTime.now());
        resume.setUpdatedAt(LocalDateTime.now());

        try {
            Resume savedResume = resumeRepository.save(resume);
            return mapToResponse(savedResume);
        } catch (RuntimeException ex) {
            deleteFailedUpload(targetLocation, ex);
            throw ex;
        }
    }

    private void deleteFailedUpload(Path targetLocation, Exception failure) {
        try {
            Files.deleteIfExists(targetLocation);
        } catch (IOException cleanupFailure) {
            failure.addSuppressed(cleanupFailure);
        }
    }

    public List<ResumeResponse> getUserResumes(User user) {
        return resumeRepository.findByUserIdOrderByUploadedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ResumeResponse getResumeById(String id, User user) {
        Resume resume = resumeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy file CV"));
        return mapToResponse(resume);
    }

    private void validatePdfFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn file CV để tải lên");
        }

        // 1. Kiểm tra kích thước (tối đa 5MB)
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("Kích thước file không được vượt quá 5MB");
        }

        // 2. Kiểm tra đuôi file (Extension)
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            throw new BadRequestException("Chỉ chấp nhận file có đuôi định dạng .pdf");
        }

        // 3. Kiểm tra Content-Type (MIME type)
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equalsIgnoreCase("application/pdf")
                && !contentType.equalsIgnoreCase("application/x-pdf"))) {
            throw new BadRequestException("Content-Type không hợp lệ, yêu cầu application/pdf");
        }

        // 4. Kiểm tra Magic Bytes (Header thực tế của file PDF: %PDF-) // 25 50 44 46
        try (InputStream is = file.getInputStream()) {
            byte[] header = is.readNBytes(5);
            if (header.length < 5 || header[0] != 0x25 || header[1] != 0x50 || header[2] != 0x44 || header[3] != 0x46 || header[4] != 0x2D) {
                throw new BadRequestException("Tệp tin tải lên không phải là định dạng PDF hợp lệ");
            }
        } catch (IOException e) {
            throw new BadRequestException("Lỗi khi đọc file: " + e.getMessage());
        }
    }

    private ResumeResponse mapToResponse(Resume resume) {
        return new ResumeResponse(
                resume.getId(),
                resume.getOriginalFileName(),
                resume.getFileSize(),
                resume.getContentType(),
                resume.getStatus(),
                resume.getUploadedAt()
        );
    }
}
