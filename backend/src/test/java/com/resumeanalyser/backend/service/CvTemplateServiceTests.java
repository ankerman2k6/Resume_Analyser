package com.resumeanalyser.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.resumeanalyser.backend.dto.PageResponse;
import com.resumeanalyser.backend.dto.template.CvTemplateDetailDto;
import com.resumeanalyser.backend.dto.template.CvTemplateSummaryDto;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.exception.NotFoundException;
import com.resumeanalyser.backend.model.CvTemplate;
import com.resumeanalyser.backend.repository.CvTemplateRepository;

@ExtendWith(MockitoExtension.class)
class CvTemplateServiceTests {

    @Mock
    CvTemplateRepository repository;

    CvTemplateService service;

    @BeforeEach
    void setUp() {
        service = new CvTemplateService(repository);
    }

    @Test
    void getActiveTemplates_sortsCreatedAtDescIdDescAndMapsSummaries() {
        ObjectId id = new ObjectId();
        CvTemplate template = new CvTemplate();
        template.setId(id);
        template.setCreatedBy(new ObjectId());
        template.setName("Clean Fresher");
        template.setDescription("Template gọn cho sinh viên và Fresher.");
        template.setThumbnailUrl("/templates/clean-fresher.png");
        template.setTemplateUrl("/templates/clean-fresher.html");
        template.setStatus("active");
        template.setCreatedAt(Instant.parse("2026-10-04T01:30:00Z"));

        when(repository.findByStatus(eq("active"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(template)));

        PageResponse<CvTemplateSummaryDto> result = service.getActiveTemplates(0, 12);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(repository).findByStatus(eq("active"), pageableCaptor.capture());
        Pageable pageable = pageableCaptor.getValue();
        assertEquals(0, pageable.getPageNumber());
        assertEquals(12, pageable.getPageSize());
        assertEquals(Sort.Direction.DESC, pageable.getSort().getOrderFor("createdAt").getDirection());
        assertEquals(Sort.Direction.DESC, pageable.getSort().getOrderFor("_id").getDirection());

        assertEquals(1, result.getContent().size());
        assertEquals(id.toHexString(), result.getContent().getFirst().id());
        assertEquals("Clean Fresher", result.getContent().getFirst().name());
        assertEquals("/templates/clean-fresher.png", result.getContent().getFirst().thumbnailUrl());
    }

    @Test
    void getActiveTemplates_validatesPageAndSizeBounds() {
        assertThrows(BadRequestException.class, () -> service.getActiveTemplates(-1, 12));
        assertThrows(BadRequestException.class, () -> service.getActiveTemplates(0, 0));
        assertThrows(BadRequestException.class, () -> service.getActiveTemplates(0, 101));
    }

    @Test
    void getActiveTemplateDetail_returnsConsistentEditorSchema() {
        ObjectId id = new ObjectId();
        CvTemplate template = new CvTemplate();
        template.setId(id);
        template.setName("Clean Fresher");
        template.setDescription("Desc");
        template.setThumbnailUrl("/templates/clean-fresher.png");
        template.setTemplateUrl("/templates/clean-fresher.html");
        template.setStatus("active");

        when(repository.findByIdAndStatus(id, "active")).thenReturn(Optional.of(template));

        CvTemplateDetailDto detail = service.getActiveTemplateDetail(id.toHexString());

        assertEquals(id.toHexString(), detail.id());
        assertEquals("/templates/clean-fresher.html", detail.templateUrl());
        assertEquals(1, detail.editorSchema().version());
        assertEquals(5, detail.editorSchema().sections().size());
        assertEquals("personalInfo", detail.editorSchema().sections().getFirst().key());
        assertTrue(detail.editorSchema().sections().getFirst().required());
    }

    @Test
    void requireActiveTemplate_throws400ForInvalidIdAnd404ForMissingOrInactive() {
        assertThrows(BadRequestException.class, () -> service.requireActiveTemplate("not-an-object-id"));

        ObjectId id = new ObjectId();
        when(repository.findByIdAndStatus(id, "active")).thenReturn(Optional.empty());
        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> service.requireActiveTemplate(id.toHexString()));
        assertEquals("RESOURCE_NOT_FOUND", ex.getCode());
    }
}
