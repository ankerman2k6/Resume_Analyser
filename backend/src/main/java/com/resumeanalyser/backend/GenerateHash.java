/* GenerateHash là class dùng tạm thời để tạo dữ liệu kiểm thử, .
BCryptPasswordEncoder dùng để hash mật khẩu.
encode() tạo chuỗi hash.
matches() kiểm tra mật khẩu với hash.
Chuỗi hash được copy vào MongoDB để test đăng nhập.*/


// CẤM LŨ CHÚNG M ĐỤNG VÀO ĐÂY
package com.resumeanalyser.backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateHash {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String password = "123456";

        String hashedPassword = encoder.encode(password);

        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hashedPassword);

        System.out.println("Verify: " +
            encoder.matches(password, hashedPassword));
    }
}