package com.resumeanalyser.backend.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.resumeanalyser.backend.dto.candidate.CreateCvFromTemplateRequest;
import com.resumeanalyser.backend.dto.candidate.CreateCvFromTemplateRequest.ContentInput;
import com.resumeanalyser.backend.dto.candidate.CreateCvFromTemplateRequest.EducationInput;
import com.resumeanalyser.backend.dto.candidate.CreateCvFromTemplateRequest.ExperienceInput;
import com.resumeanalyser.backend.dto.candidate.CreateCvFromTemplateRequest.PersonalInfoInput;
import com.resumeanalyser.backend.exception.FileStorageException;
import com.resumeanalyser.backend.exception.PayloadTooLargeException;
import com.resumeanalyser.backend.model.CvTemplate;

@Service
public class CvTemplatePdfRenderer {

    public static final int MAX_PDF_BYTES = 5 * 1024 * 1024;

    private static final String DEFAULT_TEMPLATE_PATH = "templates/cv/default.html";
    private static final Pattern SAFE_TEMPLATE_URL_PATTERN = Pattern.compile("^/templates/([a-z0-9-]+\\.html)$");

    private static final String FONT_REGULAR = "fonts/DejaVuSans.ttf";
    private static final String FONT_BOLD = "fonts/DejaVuSans-Bold.ttf";
    private static final String FONT_ITALIC = "fonts/DejaVuSans-Oblique.ttf";

    public byte[] render(CvTemplate template, CreateCvFromTemplateRequest request) {
        String templateHtml = loadTrustedTemplate(template);
        String populatedHtml = populateTemplate(templateHtml, request);
        byte[] pdfBytes = renderXhtmlToPdf(populatedHtml);

        if (pdfBytes.length < 5
                || pdfBytes[0] != '%'
                || pdfBytes[1] != 'P'
                || pdfBytes[2] != 'D'
                || pdfBytes[3] != 'F'
                || pdfBytes[4] != '-') {
            throw new FileStorageException("FILE_STORAGE_UNAVAILABLE", "PDF kết xuất không hợp lệ.");
        }
        if (pdfBytes.length > MAX_PDF_BYTES) {
            throw new PayloadTooLargeException("FILE_TOO_LARGE", "Tệp PDF kết xuất vượt quá giới hạn 5 MB.");
        }
        return pdfBytes;
    }

    private String loadTrustedTemplate(CvTemplate template) {
        if (template != null && template.getTemplateUrl() != null) {
            Matcher matcher = SAFE_TEMPLATE_URL_PATTERN.matcher(template.getTemplateUrl().trim());
            if (matcher.matches()) {
                ClassPathResource candidate = new ClassPathResource("templates/cv/" + matcher.group(1));
                if (candidate.exists()) {
                    return readClasspathUtf8(candidate);
                }
            }
        }
        return readClasspathUtf8(new ClassPathResource(DEFAULT_TEMPLATE_PATH));
    }

    private String readClasspathUtf8(ClassPathResource resource) {
        try (InputStream is = resource.getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new FileStorageException("FILE_STORAGE_UNAVAILABLE", "Không thể đọc tài nguyên mẫu CV.");
        }
    }

    private String populateTemplate(String templateHtml, CreateCvFromTemplateRequest request) {
        ContentInput content = request.content();
        PersonalInfoInput personal = content.personalInfo();

        return templateHtml
                .replace("{{PAGE_TITLE}}", escapeXml(request.title().trim()))
                .replace("{{FULL_NAME}}", escapeXml(personal.fullName().trim()))
                .replace("{{CONTACT_LINE}}", buildContactLine(personal))
                .replace("{{LINKS_BLOCK}}", buildLinksBlock(personal.links()))
                .replace("{{SUMMARY_SECTION}}", buildSummarySection(content.summary()))
                .replace("{{EXPERIENCE_SECTION}}", buildExperienceSection(content.experience()))
                .replace("{{EDUCATION_SECTION}}", buildEducationSection(content.education()))
                .replace("{{SKILLS_SECTION}}", buildSkillsSection(content.skills()));
    }

    private String buildContactLine(PersonalInfoInput personal) {
        StringBuilder sb = new StringBuilder();
        appendContactPart(sb, personal.email());
        appendContactPart(sb, personal.phone());
        appendContactPart(sb, personal.location());
        return sb.toString();
    }

    private void appendContactPart(StringBuilder sb, String value) {
        if (value == null || value.isBlank()) {
            return;
        }
        if (!sb.isEmpty()) {
            sb.append(" &#8226; ");
        }
        sb.append(escapeXml(value.trim()));
    }

    private String buildLinksBlock(List<String> links) {
        if (links == null || links.isEmpty()) {
            return "";
        }
        StringBuilder sb = new StringBuilder("<p class=\"cv-links\">");
        boolean first = true;
        for (String link : links) {
            if (link == null || link.isBlank()) {
                continue;
            }
            if (!first) {
                sb.append(" &#183; ");
            }
            sb.append(escapeXml(link.trim()));
            first = false;
        }
        sb.append("</p>");
        return first ? "" : sb.toString();
    }

    private String buildSummarySection(String summary) {
        if (summary == null || summary.isBlank()) {
            return "";
        }
        return "<div class=\"cv-section\">"
                + "<h2 class=\"cv-section-title\">Giới thiệu</h2>"
                + "<p class=\"cv-summary\">" + escapeMultilineXml(summary.trim()) + "</p>"
                + "</div>";
    }

    private String buildExperienceSection(List<ExperienceInput> experience) {
        if (experience == null || experience.isEmpty()) {
            return "";
        }
        List<TimelineEntry> entries = experience.stream()
                .filter(item -> item != null)
                .map(item -> new TimelineEntry(
                        item.role(), item.company(), item.startDate(), item.endDate(), item.description()))
                .toList();
        return buildTimelineSection("Kinh nghiệm", entries);
    }

    private String buildEducationSection(List<EducationInput> education) {
        if (education == null || education.isEmpty()) {
            return "";
        }
        List<TimelineEntry> entries = education.stream()
                .filter(item -> item != null)
                .map(item -> new TimelineEntry(
                        item.school(), item.degree(), item.startDate(), item.endDate(), item.description()))
                .toList();
        return buildTimelineSection("Học vấn", entries);
    }

    private String buildTimelineSection(String sectionTitle, List<TimelineEntry> entries) {
        StringBuilder body = new StringBuilder();
        for (TimelineEntry entry : entries) {
            String title = trimToEmpty(entry.primary());
            String subtitle = trimToEmpty(entry.secondary());
            String description = trimToEmpty(entry.description());
            if (title.isEmpty() && subtitle.isEmpty() && description.isEmpty()) {
                continue;
            }
            String displayTitle = !title.isEmpty() ? title : subtitle;
            String displaySubtitle = !title.isEmpty() ? subtitle : "";
            String dates = formatDateRange(entry.startDate(), entry.endDate());

            body.append("<div class=\"cv-entry\">");
            body.append("<table class=\"cv-entry-header\"><tr>");
            body.append("<td class=\"cv-entry-title\">").append(escapeXml(displayTitle)).append("</td>");
            body.append("<td class=\"cv-entry-dates\">").append(escapeXml(dates)).append("</td>");
            body.append("</tr></table>");
            if (!displaySubtitle.isEmpty()) {
                body.append("<div class=\"cv-entry-subtitle\">").append(escapeXml(displaySubtitle)).append("</div>");
            }
            if (!description.isEmpty()) {
                body.append("<p class=\"cv-entry-desc\">").append(escapeMultilineXml(description)).append("</p>");
            }
            body.append("</div>");
        }
        if (body.isEmpty()) {
            return "";
        }
        return "<div class=\"cv-section\">"
                + "<h2 class=\"cv-section-title\">" + escapeXml(sectionTitle) + "</h2>"
                + body
                + "</div>";
    }

    private String buildSkillsSection(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return "";
        }
        StringBuilder items = new StringBuilder();
        for (String skill : skills) {
            if (skill == null || skill.isBlank()) {
                continue;
            }
            items.append("<span class=\"cv-skill-item\">")
                    .append(escapeXml(skill.trim()))
                    .append("</span>");
        }
        if (items.isEmpty()) {
            return "";
        }
        return "<div class=\"cv-section\">"
                + "<h2 class=\"cv-section-title\">Kỹ năng</h2>"
                + "<div class=\"cv-skills-list\">" + items + "</div>"
                + "</div>";
    }

    private byte[] renderXhtmlToPdf(String xhtml) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            // Chặn tải tài nguyên ngoài (chỉ dùng tài nguyên nội bộ đã nhúng).
            builder.useUriResolver((baseUri, uri) -> null);
            registerFont(builder, FONT_REGULAR, 400, PdfRendererBuilder.FontStyle.NORMAL);
            registerFont(builder, FONT_BOLD, 700, PdfRendererBuilder.FontStyle.NORMAL);
            registerFont(builder, FONT_ITALIC, 400, PdfRendererBuilder.FontStyle.ITALIC);
            builder.withHtmlContent(xhtml, null);
            builder.toStream(out);
            builder.run();
            return out.toByteArray();
        } catch (Exception ex) {
            throw new FileStorageException("FILE_STORAGE_UNAVAILABLE", "Không thể kết xuất PDF cho mẫu CV.");
        }
    }

    private void registerFont(
            PdfRendererBuilder builder,
            String classpathLocation,
            int weight,
            PdfRendererBuilder.FontStyle style) {
        ClassPathResource font = new ClassPathResource(classpathLocation);
        builder.useFont(() -> {
            try {
                return font.getInputStream();
            } catch (IOException ex) {
                throw new IllegalStateException("Không thể nạp font " + classpathLocation, ex);
            }
        }, "DejaVu Sans", weight, style, true);
    }

    private String formatDateRange(String startDate, String endDate) {
        String start = trimToEmpty(startDate);
        String end = trimToEmpty(endDate);
        if (!start.isEmpty() && !end.isEmpty()) {
            return start + " - " + end;
        }
        return !start.isEmpty() ? start : end;
    }

    private String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private String escapeMultilineXml(String input) {
        return escapeXml(input).replace("\r\n", "\n").replace("\r", "\n").replace("\n", "<br/>");
    }

    static String escapeXml(String input) {
        if (input == null || input.isEmpty()) {
            return "";
        }
        StringBuilder out = new StringBuilder(input.length());
        for (int i = 0; i < input.length(); i++) {
            char ch = input.charAt(i);
            if (!isValidXmlChar(ch)) {
                continue;
            }
            switch (ch) {
                case '&' -> out.append("&amp;");
                case '<' -> out.append("&lt;");
                case '>' -> out.append("&gt;");
                case '"' -> out.append("&quot;");
                case '\'' -> out.append("&#39;");
                default -> out.append(ch);
            }
        }
        return out.toString();
    }

    private static boolean isValidXmlChar(char ch) {
        return ch == 0x9 || ch == 0xA || ch == 0xD || (ch >= 0x20 && ch <= 0xD7FF) || (ch >= 0xE000 && ch <= 0xFFFD);
    }

    private record TimelineEntry(
            String primary,
            String secondary,
            String startDate,
            String endDate,
            String description
    ) {
    }
}
