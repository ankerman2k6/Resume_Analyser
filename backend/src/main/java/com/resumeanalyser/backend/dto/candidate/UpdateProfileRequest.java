package com.resumeanalyser.backend.dto.candidate;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @NotBlank(message = "Họ tên không được để trống.")
    @Size(max = 120, message = "Họ tên tối đa 120 ký tự.")
    private String fullName;

    @NotNull(message = "Số điện thoại không được null (gửi chuỗi rỗng để xóa).")
    @Size(max = 30, message = "Số điện thoại tối đa 30 ký tự.")
    @Pattern(regexp = "^$|^[0-9+\\s\\-()]*[0-9][0-9+\\s\\-()]*$", message = "Số điện thoại chỉ chứa chữ số, +, khoảng trắng, -, (, ) và phải có ít nhất một chữ số nếu có nội dung.")
    private String phone;

    @NotNull(message = "Thông tin địa điểm không được để trống.")
    @Valid
    private LocationInput location;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String fullName, String phone, LocationInput location) {
        this.fullName = fullName;
        this.phone = phone;
        this.location = location;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocationInput getLocation() {
        return location;
    }

    public void setLocation(LocationInput location) {
        this.location = location;
    }

    public static class LocationInput {
        @NotNull(message = "Thành phố không được null (gửi chuỗi rỗng nếu không có).")
        @Size(max = 120, message = "Thành phố tối đa 120 ký tự.")
        private String city;

        @NotNull(message = "Quốc gia không được null (gửi chuỗi rỗng nếu không có).")
        @Size(max = 120, message = "Quốc gia tối đa 120 ký tự.")
        private String country;

        public LocationInput() {
        }

        public LocationInput(String city, String country) {
            this.city = city;
            this.country = country;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getCountry() {
            return country;
        }

        public void setCountry(String country) {
            this.country = country;
        }
    }
}
