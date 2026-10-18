package com.resumeanalyser.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.resumeanalyser.backend.dto.ResumeResponse;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.model.Resume;
import com.resumeanalyser.backend.model.User;
import com.resumeanalyser.backend.repository.ResumeRepository;

@ExtendWith(MockitoExtension.class)
class ResumeServiceTest {

    @Mock
    private ResumeRepository resumeRepository;

    @TempDir
    Path tempUploadDir;

    private ResumeService resumeService;
    private User testUser;

    @BeforeEach
    void setUp() {
        resumeService = new ResumeService(resumeRepository, tempUploadDir.toString());

        testUser = new User();
        testUser.setId("user123");
        testUser.setEmail("test@example.com");
    }

    @Test
    void uploadResume_successWithValidPdf() throws IOException {
        // PDF signature: %PDF-1.4
        byte[] pdfContent = "%PDF-1.4 sample content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "my_cv.pdf",
                "application/pdf",
                pdfContent
        );

        when(resumeRepository.save(any(Resume.class))).thenAnswer(invocation -> {
            Resume r = invocation.getArgument(0);
            r.setId("resume999");
            return r;
        });

        ResumeResponse response = resumeService.uploadResume(file, testUser);

        assertNotNull(response);
        assertEquals("resume999", response.getId());
        assertEquals("my_cv.pdf", response.getOriginalFileName());
        assertEquals("application/pdf", response.getContentType());
        assertEquals("UPLOADED", response.getStatus());
        verify(resumeRepository).save(any(Resume.class));
    }

    @Test
    void uploadResume_rejectEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.pdf",
                "application/pdf",
                new byte[0]
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                resumeService.uploadResume(emptyFile, testUser)
        );

        assertEquals("Vui lòng chọn file CV để tải lên", ex.getMessage());
    }

    @Test
    void uploadResume_rejectOver5Mb() {
        byte[] largeContent = new byte[5 * 1024 * 1024 + 1];
        System.arraycopy("%PDF-".getBytes(), 0, largeContent, 0, 5);

        MockMultipartFile largeFile = new MockMultipartFile(
                "file",
                "large.pdf",
                "application/pdf",
                largeContent
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                resumeService.uploadResume(largeFile, testUser)
        );

        assertEquals("Kích thước file không được vượt quá 5MB", ex.getMessage());
    }

    @Test
    void uploadResume_rejectNonPdfExtension() {
        MockMultipartFile wordFile = new MockMultipartFile(
                "file",
                "cv.docx",
                "application/pdf",
                "%PDF-fake".getBytes()
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                resumeService.uploadResume(wordFile, testUser)
        );

        assertEquals("Chỉ chấp nhận file có đuôi định dạng .pdf", ex.getMessage());
    }

    @Test
    void uploadResume_rejectNonPdfMimeType() {
        MockMultipartFile textFile = new MockMultipartFile(
                "file",
                "cv.pdf",
                "text/plain",
                "%PDF-fake".getBytes()
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                resumeService.uploadResume(textFile, testUser)
        );

        assertEquals("Content-Type không hợp lệ, yêu cầu application/pdf", ex.getMessage());
    }

    @Test
    void uploadResume_rejectFakedPdfWithoutMagicBytes() {
        // File has .pdf name and application/pdf contentType, but contents are fake
        MockMultipartFile fakeFile = new MockMultipartFile(
                "file",
                "fake.pdf",
                "application/pdf",
                "NOT_A_REAL_PDF".getBytes()
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                resumeService.uploadResume(fakeFile, testUser)
        );

        assertEquals("Tệp tin tải lên không phải là định dạng PDF hợp lệ", ex.getMessage());
    }
}
