package com.resumeanalyser.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.resumeanalyser.backend.dto.PageResponse;
import com.resumeanalyser.backend.dto.template.CvTemplateDetailDto;
import com.resumeanalyser.backend.dto.template.CvTemplateSummaryDto;
import com.resumeanalyser.backend.service.CvTemplateService;

@RestController
@RequestMapping("/api/cv-templates")
public class CvTemplateController {

    private final CvTemplateService cvTemplateService;

    public CvTemplateController(CvTemplateService cvTemplateService) {
        this.cvTemplateService = cvTemplateService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<CvTemplateSummaryDto>> listTemplates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(cvTemplateService.getActiveTemplates(page, size));
    }

    @GetMapping("/{templateId}")
    public ResponseEntity<CvTemplateDetailDto> getTemplateDetail(@PathVariable String templateId) {
        return ResponseEntity.ok(cvTemplateService.getActiveTemplateDetail(templateId));
    }
}
