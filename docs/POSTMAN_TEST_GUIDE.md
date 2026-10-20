# Hướng Dẫn Test Candidate Profile APIs Bằng Postman

Tài liệu hướng dẫn kiểm thử các API phân hệ **Candidate Profile (Trang cá nhân ứng viên)** độc lập với Frontend, nhanh chóng và chính xác.

---

## 1. Chuẩn Bị & Nạp Collection

1. Khởi động Backend (Spring Boot chạy tại `http://localhost:8080`).
2. Mở **Postman** -> Bấm **Import** -> Chọn file trong thư mục dự án:
   > **`docs/Candidate_Profile_API.postman_collection.json`**
3. Collection đã tích hợp sẵn:
   - Biến môi trường: `baseUrl` (`http://localhost:8080`) và `token`.
   - **Kịch bản tự động lưu JWT**: Khi đăng nhập thành công, Postman tự động gán token cho toàn bộ các request còn lại.

---

## 2. Quy Trình Test Chi Tiết (Theo Thứ Tự)

### Bước 1: Đăng nhập lấy Token tự động
* **Request:** `0. Auth - Login (Tự động lưu Token)` (`POST /api/auth/login`)
* **Cách dùng:** Vào tab **Body**, nhập `email` và `password` tài khoản ứng viên -> Bấm **Send**.
* **Kỳ vọng:** Trả về `200 OK` kèm Token. Token đã tự động được nạp, bạn có thể chạy ngay các request tiếp theo mà không cần copy paste thủ công.

---

### Bước 2: Quản lý Hồ sơ cá nhân (Profile)
* **`1. Profile - GET`** (`GET /api/candidates/me/profile`):
  * Lấy thông tin cá nhân hiện tại.
  * *Kỳ vọng:* `200 OK` (hoặc `404 PROFILE_NOT_FOUND` nếu tài khoản mới tinh chưa tạo hồ sơ).
* **`2. Profile - PUT (Create or Update)`** (`PUT /api/candidates/me/profile`):
  * Tạo mới hoặc cập nhật hồ sơ (`fullName`, `phone`, `location.city`, `location.country`).
  * *Kỳ vọng:* `201 Created` (lần đầu tạo) hoặc `200 OK` (cập nhật).

---

### Bước 3: Xem Thống kê Dashboard (Stats)
* **`3. Stats - GET`** (`GET /api/candidates/me/stats`):
  * Lấy tổng quan số lượng CV, số đơn ứng tuyển (phân loại theo từng trạng thái) và điểm match AI trung bình.
  * *Kỳ vọng:* `200 OK`.

---

### Bước 4: Danh sách Đơn ứng tuyển (GetList Applications)
* **`4. Applications - GET List`** (`GET /api/candidates/me/applications`):
  * **Test phân trang:** Truyền `page=0&size=10` trong tab **Params**.
  * **Test bộ lọc:** Thay đổi giá trị param `filter`:
    * `all`: Tất cả đơn.
    * `applied`: Đơn vừa nộp.
    * `reviewing`: Đơn đang được HR xem xét.
    * `interview`: Đơn đã có lịch phỏng vấn.
    * `accepted`: Đơn trúng tuyển.
    * `rejected`: Đơn chưa phù hợp.
    * `withdrawn`: Đơn ứng viên đã rút.
  * **Test bắt lỗi (Validation 400):** Thử đặt `filter=sai_dinh_dang`, `page=-1`, hoặc `size=150` -> Kỳ vọng trả về **`400 Bad Request`**.

---

### Bước 5: Rút đơn ứng tuyển (Withdraw)
* **`5. Applications - Withdraw`** (`POST /api/candidates/me/applications/:applicationId/withdraw`):
  * Điền `applicationId` của đơn cần rút vào phần **Params**.
  * *Kỳ vọng:*
    * Đơn đang ở trạng thái `applied` -> Rút thành công, status chuyển thành `withdrawn` (`200 OK`).
    * Đơn đang ở trạng thái khác (đã duyệt/phỏng vấn) -> Trả về **`409 Conflict`** (`APPLICATION_NOT_WITHDRAWABLE`).

---

### Bước 6: Quản lý CV (Upload, GetList, Xem file, Xóa)
1. **`9. Resumes - POST Upload`** (`POST /api/resumes/upload`):
   * Vào tab **Body** -> Tại dòng `file`, chọn 1 file PDF thực tế từ máy -> Bấm **Send**.
   * *Kỳ vọng:* `201 Created` trả về thông tin CV. Copy chuỗi `_id` từ kết quả để test các bước tiếp theo.
2. **`6. Resumes - GET List`** (`GET /api/candidates/me/cvs`):
   * Lấy danh sách CV có phân trang (`page`, `size`), sắp xếp mới nhất lên đầu.
   * *Kỳ vọng:* `200 OK`, kiểm tra 2 cờ `canViewFile: true` và `canDelete: true`.
3. **`7. Resumes - GET File`** (`GET /api/candidates/me/cvs/:cvId/file`):
   * Điền mã `_id` vào param `:cvId` -> Bấm **Send**.
   * *Kỳ vọng:* `200 OK`, hiển thị luồng stream nội dung file PDF trực tiếp.
4. **`10. Career - GET`** (`GET /api/candidates/me/career`):
   * Xem kỹ năng, kinh nghiệm, học vấn trích xuất từ CV.
   * *Kỳ vọng:* `200 OK`.
5. **`8. Resumes - DELETE`** (`DELETE /api/candidates/me/cvs/:cvId`):
   * Điền mã `_id` vào param `:cvId` -> Bấm **Send**.
   * *Kỳ vọng:* `204 No Content` (Xóa thành công khỏi database và server).
   * *Lưu ý:* Nếu CV đã nộp vào một công việc nào đó, API sẽ chặn xóa và trả về **`409 CV_IN_USE`**.

---

## 3. Bảng Tra Cứu Mã Trả Về (HTTP Status Codes)

| Mã HTTP | Tình Huống | Ý Nghĩa Nghiệp Vụ |
|:---:|---|---|
| **`200 OK`** | GET, PUT cập nhật, Withdraw | Thao tác thành công. |
| **`201 Created`** | PUT tạo mới Profile, Upload CV | Tạo mới tài nguyên thành công. |
| **`204 No Content`**| DELETE CV | Xóa CV thành công, không trả nội dung body. |
| **`400 Bad Request`**| Param sai, file rỗng, JSON hỏng | Lỗi kiểm tra dữ liệu đầu vào (`VALIDATION_ERROR`). |
| **`401 Unauthorized`**| Thiếu token, token sai/hết hạn | Chưa xác thực (`UNAUTHENTICATED`). |
| **`403 Forbidden`** | Đăng nhập tài khoản Recruiter | Không có quyền ứng viên (`FORBIDDEN`). |
| **`404 Not Found`** | Chưa có Profile, sai ID CV/Đơn | Không tìm thấy tài nguyên (`RESOURCE_NOT_FOUND`, `PROFILE_NOT_FOUND`). |
| **`409 Conflict`** | Rút đơn sai trạng thái, xóa CV đang dùng | Xung đột logic nghiệp vụ (`CV_IN_USE`, `APPLICATION_NOT_WITHDRAWABLE`). |
| **`413 Payload Too Large`** | File CV nặng > 5MB | Vượt quá dung lượng cho phép (`FILE_TOO_LARGE`). |
| **`415 Unsupported Type`** | Tệp tải lên không phải chuẩn PDF | Định dạng tệp không được hỗ trợ (`UNSUPPORTED_FILE_TYPE`). |
