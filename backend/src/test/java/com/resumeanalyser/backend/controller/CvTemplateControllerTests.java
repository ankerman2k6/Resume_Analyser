package com.resumeanalyser.backend.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.resumeanalyser.backend.dto.PageResponse;
import com.resumeanalyser.backend.dto.template.CvTemplateDetailDto;
import com.resumeanalyser.backend.dto.template.CvTemplateSummaryDto;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.exception.GlobalExceptionHandler;
import com.resumeanalyser.backend.exception.NotFoundException;
import com.resumeanalyser.backend.repository.UserRepository;
import com.resumeanalyser.backend.security.JwtAuthenticationFilter;
import com.resumeanalyser.backend.security.JwtService;
import com.resumeanalyser.backend.security.SecurityConfig;
import com.resumeanalyser.backend.service.CvTemplateService;

@WebMvcTest(CvTemplateController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, GlobalExceptionHandler.class,
        CvTemplateControllerTests.JwtTestConfig.class})
class CvTemplateControllerTests {

    @TestConfiguration
    static class JwtTestConfig {
        @Bean
        JwtService jwtService() {
            return new JwtService("cv-template-controller-test-secret-32-bytes", 60_000);
        }
    }

    @Autowired
    MockMvc mvc;

    @MockitoBean
    CvTemplateService cvTemplateService;

    @MockitoBean
    UserRepository userRepository;

    @Test
    void listTemplates_isPublicAndDefaultsPageZeroSizeTwelve() throws Exception {
        String id = new ObjectId().toHexString();
        PageResponse<CvTemplateSummaryDto> page = new PageResponse<>(
                List.of(new CvTemplateSummaryDto(
                        id,
                        "Clean Fresher",
                        "Template gọn cho sinh viên và Fresher.",
                        "/templates/clean-fresher.png",
                        "active"
                )),
                0, 12, 1, 1, true
        );
        when(cvTemplateService.getActiveTemplates(0, 12)).thenReturn(page);

        mvc.perform(get("/api/cv-templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(12))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].id").value(id))
                .andExpect(jsonPath("$.content[0].status").value("active"))
                .andExpect(jsonPath("$.content[0].createdBy").doesNotExist());

        verify(cvTemplateService).getActiveTemplates(0, 12);
    }

    @Test
    void listTemplates_rejectsInvalidPagination() throws Exception {
        when(cvTemplateService.getActiveTemplates(0, 101))
                .thenThrow(new BadRequestException("VALIDATION_ERROR", "Tham số size phải từ 1 đến 100."));

        mvc.perform(get("/api/cv-templates").param("page", "0").param("size", "101"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void getTemplateDetail_isPublicAndReturnsEditorSchema() throws Exception {
        String id = new ObjectId().toHexString();
        CvTemplateDetailDto detail = new CvTemplateDetailDto(
                id,
                "Clean Fresher",
                "Template gọn cho sinh viên và Fresher.",
                "/templates/clean-fresher.png",
                "/templates/clean-fresher.html",
                "active",
                new CvTemplateDetailDto.EditorSchemaDto(
                        1,
                        List.of(
                                new CvTemplateDetailDto.SectionDto("personalInfo", "Thông tin cá nhân", true),
                                new CvTemplateDetailDto.SectionDto("summary", "Giới thiệu", false)
                        )
                )
        );
        when(cvTemplateService.getActiveTemplateDetail(id)).thenReturn(detail);

        mvc.perform(get("/api/cv-templates/{templateId}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.templateUrl").value("/templates/clean-fresher.html"))
                .andExpect(jsonPath("$.editorSchema.version").value(1))
                .andExpect(jsonPath("$.editorSchema.sections[0].key").value("personalInfo"))
                .andExpect(jsonPath("$.editorSchema.sections[0].required").value(true));
    }

    @Test
    void getTemplateDetail_returns400OnInvalidIdAnd404WhenMissing() throws Exception {
        when(cvTemplateService.getActiveTemplateDetail("bad-id"))
                .thenThrow(new BadRequestException("VALIDATION_ERROR", "templateId không hợp lệ."));
        String missingId = new ObjectId().toHexString();
        when(cvTemplateService.getActiveTemplateDetail(missingId))
                .thenThrow(new NotFoundException("RESOURCE_NOT_FOUND", "Không tìm thấy mẫu CV khả dụng."));

        mvc.perform(get("/api/cv-templates/bad-id"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));

        mvc.perform(get("/api/cv-templates/{id}", missingId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));
    }
}
