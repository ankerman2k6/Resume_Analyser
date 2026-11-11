package com.resumeanalyser.backend.service;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.resumeanalyser.backend.dto.PageResponse;
import com.resumeanalyser.backend.dto.template.CvTemplateDetailDto;
import com.resumeanalyser.backend.dto.template.CvTemplateSummaryDto;
import com.resumeanalyser.backend.exception.BadRequestException;
import com.resumeanalyser.backend.exception.NotFoundException;
import com.resumeanalyser.backend.model.CvTemplate;
import com.resumeanalyser.backend.repository.CvTemplateRepository;

@Service
public class CvTemplateService {

    private static final String ACTIVE_STATUS = "active";

    private static final CvTemplateDetailDto.EditorSchemaDto DEFAULT_EDITOR_SCHEMA =
            new CvTemplateDetailDto.EditorSchemaDto(
                    1,
                    List.of(
                            new CvTemplateDetailDto.SectionDto("personalInfo", "Thông tin cá nhân", true),
                            new CvTemplateDetailDto.SectionDto("summary", "Giới thiệu", false),
                            new CvTemplateDetailDto.SectionDto("experience", "Kinh nghiệm", false),
                            new CvTemplateDetailDto.SectionDto("education", "Học vấn", false),
                            new CvTemplateDetailDto.SectionDto("skills", "Kỹ năng", false)
                    )
            );

    private final CvTemplateRepository cvTemplateRepository;

    public CvTemplateService(CvTemplateRepository cvTemplateRepository) {
        this.cvTemplateRepository = cvTemplateRepository;
    }

    public PageResponse<CvTemplateSummaryDto> getActiveTemplates(int page, int size) {
        if (page < 0) {
            throw new BadRequestException("VALIDATION_ERROR", "Tham số page phải lớn hơn hoặc bằng 0.");
        }
        if (size < 1 || size > 100) {
            throw new BadRequestException("VALIDATION_ERROR", "Tham số size phải từ 1 đến 100.");
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt", "_id")
        );
        Page<CvTemplate> result = cvTemplateRepository.findByStatus(ACTIVE_STATUS, pageable);

        List<CvTemplateSummaryDto> content = result.getContent().stream()
                .map(this::mapToSummaryDto)
                .toList();

        return new PageResponse<>(
                content,
                page,
                size,
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    public CvTemplateDetailDto getActiveTemplateDetail(String templateId) {
        CvTemplate template = requireActiveTemplate(templateId);
        return new CvTemplateDetailDto(
                template.getId() != null ? template.getId().toHexString() : null,
                template.getName(),
                template.getDescription(),
                template.getThumbnailUrl(),
                template.getTemplateUrl(),
                template.getStatus(),
                DEFAULT_EDITOR_SCHEMA
        );
    }

    public CvTemplate requireActiveTemplate(String templateId) {
        if (templateId == null || !ObjectId.isValid(templateId)) {
            throw new BadRequestException("VALIDATION_ERROR", "templateId không hợp lệ.");
        }
        ObjectId id = new ObjectId(templateId);
        return cvTemplateRepository.findByIdAndStatus(id, ACTIVE_STATUS)
                .orElseThrow(() -> new NotFoundException("RESOURCE_NOT_FOUND", "Không tìm thấy mẫu CV khả dụng."));
    }

    private CvTemplateSummaryDto mapToSummaryDto(CvTemplate template) {
        return new CvTemplateSummaryDto(
                template.getId() != null ? template.getId().toHexString() : null,
                template.getName(),
                template.getDescription(),
                template.getThumbnailUrl(),
                template.getStatus()
        );
    }
}
