package com.resumeanalyser.backend.dto.candidate;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateCvFromTemplateRequest(
        @NotBlank(message = "templateId là bắt buộc.")
        String templateId,

        @NotBlank(message = "Tiêu đề CV là bắt buộc.")
        @Size(max = 150, message = "Tiêu đề CV tối đa 150 ký tự.")
        String title,

        @NotNull(message = "Nội dung CV là bắt buộc.")
        @Valid
        ContentInput content
) {
    public record ContentInput(
            @NotNull(message = "Thông tin cá nhân là bắt buộc.")
            @Valid
            PersonalInfoInput personalInfo,

            @Size(max = 5000, message = "Giới thiệu bản thân tối đa 5000 ký tự.")
            String summary,

            @Size(max = 30, message = "Tối đa 30 mục kinh nghiệm.")
            @Valid
            List<ExperienceInput> experience,

            @Size(max = 20, message = "Tối đa 20 mục học vấn.")
            @Valid
            List<EducationInput> education,

            @Size(max = 50, message = "Tối đa 50 kỹ năng.")
            List<
                    @NotNull(message = "Kỹ năng không được null.")
                    @NotBlank(message = "Tên kỹ năng không được để trống.")
                    @Size(max = 100, message = "Tên kỹ năng tối đa 100 ký tự.")
                    String> skills
    ) {
    }

    public record PersonalInfoInput(
            @NotBlank(message = "Họ tên là bắt buộc.")
            @Size(max = 120, message = "Họ tên tối đa 120 ký tự.")
            String fullName,

            @NotBlank(message = "Email là bắt buộc.")
            @Email(message = "Email không đúng định dạng.")
            @Size(max = 254, message = "Email tối đa 254 ký tự.")
            String email,

            @Size(max = 30, message = "Số điện thoại tối đa 30 ký tự.")
            String phone,

            @Size(max = 120, message = "Địa điểm tối đa 120 ký tự.")
            String location,

            @Size(max = 20, message = "Tối đa 20 liên kết.")
            List<
                    @NotNull(message = "Liên kết không được null.")
                    @NotBlank(message = "Liên kết không được để trống.")
                    @Size(max = 500, message = "Liên kết tối đa 500 ký tự.")
                    String> links
    ) {
    }

    public record ExperienceInput(
            @Size(max = 120, message = "Vai trò tối đa 120 ký tự.")
            String role,

            @Size(max = 150, message = "Tên công ty tối đa 150 ký tự.")
            String company,

            @Size(max = 30, message = "Ngày bắt đầu tối đa 30 ký tự.")
            String startDate,

            @Size(max = 30, message = "Ngày kết thúc tối đa 30 ký tự.")
            String endDate,

            @Size(max = 2000, message = "Mô tả kinh nghiệm tối đa 2000 ký tự.")
            String description
    ) {
    }

    public record EducationInput(
            @Size(max = 150, message = "Tên trường tối đa 150 ký tự.")
            String school,

            @Size(max = 120, message = "Bằng cấp tối đa 120 ký tự.")
            String degree,

            @Size(max = 30, message = "Ngày bắt đầu tối đa 30 ký tự.")
            String startDate,

            @Size(max = 30, message = "Ngày kết thúc tối đa 30 ký tự.")
            String endDate,

            @Size(max = 2000, message = "Mô tả học vấn tối đa 2000 ký tự.")
            String description
    ) {
    }
}
