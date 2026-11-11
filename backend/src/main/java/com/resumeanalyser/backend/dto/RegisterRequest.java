package com.resumeanalyser.backend.dto;

import java.util.Locale;
import java.util.ArrayList;
import java.util.List;

import com.resumeanalyser.backend.model.CandidateProfile;
import com.resumeanalyser.backend.model.Company;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    private String role;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String position;
    private CandidateProfile.Location location;
    private CompanyData company;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
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

public String getAvatarUrl() {
    return avatarUrl;
}

public void setAvatarUrl(String avatarUrl) {
    this.avatarUrl = avatarUrl;
}

public String getPosition() {
    return position;
}

public void setPosition(String position) {
    this.position = position;
}

public CandidateProfile.Location getLocation() {
    return location;
}

public void setLocation(CandidateProfile.Location location) {
    this.location = location;
}

public CompanyData getCompany() {
    return company;
}

public void setCompany(CompanyData company) {
    this.company = company;
}

public static class CompanyData {
    private String name;
    private String industry;
    private String logoUrl;
    private String description;
    private List<Company.Location> locations = new ArrayList<>();
    private String size;
    private String website;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Company.Location> getLocations() {
        return locations;
    }

    public void setLocations(List<Company.Location> locations) {
        this.locations = locations == null ? new ArrayList<>() : locations;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }
}

}
