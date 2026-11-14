package com.resumeanalyser.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;

import com.resumeanalyser.backend.dto.candidate.CreateCvFromTemplateRequest;
import com.resumeanalyser.backend.model.CvTemplate;

class CvTemplatePdfRendererTests {

    private final CvTemplatePdfRenderer renderer = new CvTemplatePdfRenderer();

    @Test
    void render_producesValidPdfWithVietnameseCharactersAndEscapesHtml() throws Exception {
        CvTemplate template = new CvTemplate();
        template.setId(new ObjectId());
        template.setName("Clean Fresher");
        template.setTemplateUrl("/templates/clean-fresher.html");
        template.setStatus("active");

        CreateCvFromTemplateRequest request = new CreateCvFromTemplateRequest(
                template.getId().toHexString(),
                "CV Nguyễn Văn A - Fresher",
                new CreateCvFromTemplateRequest.ContentInput(
                        new CreateCvFromTemplateRequest.PersonalInfoInput(
                                "Nguyễn Văn A <script>alert(1)</script>",
                                "a@example.com",
                                "0900000000",
                                "Hà Nội & Đà Nẵng",
                                List.of("https://github.com/example")
                        ),
                        "Sinh viên mới tốt nghiệp ĐH Bách Khoa.\nĐam mê Backend.",
                        List.of(new CreateCvFromTemplateRequest.ExperienceInput(
                                "Thực tập sinh", "Công ty A & B", "2026-01", "2026-06", "Xây dựng API"
                        )),
                        List.of(new CreateCvFromTemplateRequest.EducationInput(
                                "Đại học A", "Cử nhân CNTT", "2022-09", "2026-06", ""
                        )),
                        List.of("Java", "Spring Boot")
                )
        );

        byte[] pdfBytes = renderer.render(template, request);

        assertTrue(pdfBytes.length > 5);
        assertTrue(pdfBytes.length <= CvTemplatePdfRenderer.MAX_PDF_BYTES);
        assertEquals("%PDF-", new String(pdfBytes, 0, 5, StandardCharsets.US_ASCII));

        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            assertTrue(document.getNumberOfPages() >= 1);
            String text = new PDFTextStripper().getText(document);
            assertTrue(text.contains("Nguyễn Văn A <script>alert(1)</script>"));
            assertTrue(text.contains("Thực tập sinh"));
            assertTrue(text.contains("Đại học A"));
            assertTrue(text.contains("Spring Boot"));
            assertFalse(text.contains("{{FULL_NAME}}"));
        }
    }

    @Test
    void render_handlesEmptyOptionalSectionsWithoutErrors() throws Exception {
        CvTemplate template = new CvTemplate();
        template.setId(new ObjectId());
        template.setTemplateUrl("/templates/non-existent.html");

        CreateCvFromTemplateRequest request = new CreateCvFromTemplateRequest(
                template.getId().toHexString(),
                "CV Minimal",
                new CreateCvFromTemplateRequest.ContentInput(
                        new CreateCvFromTemplateRequest.PersonalInfoInput(
                                "Trần Thị B", "b@example.com", null, null, List.of()
                        ),
                        null, List.of(), List.of(), List.of()
                )
        );

        byte[] pdfBytes = renderer.render(template, request);
        assertEquals("%PDF-", new String(pdfBytes, 0, 5, StandardCharsets.US_ASCII));

        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            String text = new PDFTextStripper().getText(document);
            assertTrue(text.contains("Trần Thị B"));
            assertFalse(text.contains("Kinh nghiệm"));
        }
    }
}
