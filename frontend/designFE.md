# Đặc tả Hệ thống Thiết kế: Ứng dụng Quét Sơ yếu lý lịch (ATS) & Phân tích bằng AI

## 1. Tổng quan Sản phẩm & Hướng thẩm mỹ
- **Loại sản phẩm:** Ứng dụng di động để Phân tích Cấu trúc Sơ yếu lý lịch, Sàng lọc và Kết nối Công việc bằng AI (Hệ thống ATS).
- **Thẩm mỹ cốt lõi:** Hiện đại, gọn gàng, đáng tin cậy và mang phong cách công nghệ AI tương lai.
- **Hình tượng Thiết kế:** Bề mặt màu xanh navy (slate navy) đậm, các thẻ màu trắng/kính sắc nét, điểm nhấn màu xanh ngọc bích (ice-blue), và các góc bo tròn mềm mại.
- **Đặc điểm Giao diện Người dùng (UI) chính:**
  * Thanh điều hướng dưới cùng dạng viên thuốc nổi với các cạnh bo tròn (phong cách Dynamic Island).
  * Các nút hành động chứa biểu tượng hình tròn.
  * Các thẻ trực quan có độ tương phản cao cho điểm số mức độ phù hợp và các tiện ích (widgets) phân tích.

---

## 2. Bảng màu & Mã màu (Tokens)

### Chế độ Sáng (Mặc định)
- **Nền (Backgrounds):**
  * `bg-primary`: `#F4F7FB` (Nền màu trắng-xanh băng dịu nhẹ)
  * `bg-surface`: `#FFFFFF` (Trắng tinh khiết cho các thẻ và trang tính nổi)
  * `bg-subtle`: `#EDF2F7` (Nền thùng chứa màu xám nhạt - light slate)
- **Màu chính & Tương phản (Primary & Contrasts):**
  * `brand-primary`: `#0F1E36` (Xanh Navy đậm ban đêm - dùng cho các thẻ hero nổi bật và thanh điều hướng dưới cùng)
  * `brand-secondary`: `#2563EB` (Xanh Cobalt rực rỡ cho các nút Kêu gọi hành động (CTA) chính và thanh tiến trình)
  * `brand-accent`: `#E0F2FE` (Sắc xanh băng cho nền huy hiệu và các trạng thái đang hoạt động)
- **Văn bản & Nội dung (Text & Content):**
  * `text-primary`: `#0F172A` (Xám 900 - tối, độ tương phản cao cho phần nội dung chính và tiêu đề)
  * `text-secondary`: `#64748B` (Xám 500 - mô tả, siêu dữ liệu, dấu thời gian)
  * `text-inverse`: `#FFFFFF` (Văn bản trắng trên các thẻ tối và thùng chứa màu xanh navy)
- **Viền & Đường chia cắt (Borders & Dividers):**
  * `border-subtle`: `#E2E8F0`
  * `border-focus`: `#3B82F6`
- **Phản hồi & Trạng thái ATS (Feedback & ATS Status):**
  * `status-success`: `#10B981` (Điểm phù hợp cao, Lọt vào danh sách rút gọn, Đạt)
  * `status-warning`: `#F59E0B` (Đang xem xét, Cần cải thiện)
  * `status-danger`: `#EF4444` (Bị loại, Thiếu Kỹ năng Chính)
  * `status-info`: `#0EA5E9` (Đã ứng tuyển, Đang xử lý phân tích)

---

### Chế độ Tối (Dark Mode)
- **Nền (Backgrounds):**
  * `bg-primary`: `#0B111E` (Nền canvas xanh navy-xám cực đậm)
  * `bg-surface`: `#162032` (Nền thẻ tối dạng nổi)
  * `bg-subtle`: `#1E293B` (Trường nhập liệu và các hộp hình viên thuốc không hoạt động)
- **Màu chính & Tương phản (Primary & Contrasts):**
  * `brand-primary`: `#1E293B` (Thùng chứa xám dạng nổi với viền 1px mờ)
  * `brand-secondary`: `#3B82F6` (Xanh Electric giúp hiển thị rõ ràng trên nền tối)
  * `brand-accent`: `rgba(56, 189, 248, 0.15)` (Ánh xanh da trời mờ cho các nút viên thuốc và thẻ tag đang hoạt động)
- **Văn bản & Nội dung (Text & Content):**
  * `text-primary`: `#F8FAFC` (Xám 50 - trắng ngà sắc nét)
  * `text-secondary`: `#94A3B8` (Xám 400 - siêu dữ liệu làm mờ đi)
  * `text-inverse`: `#0F172A` (Văn bản tối màu khi dùng trên các nút nhấn sáng màu)
- **Viền & Đường chia cắt (Borders & Dividers):**
  * `border-subtle`: `rgba(255, 255, 255, 0.08)`
  * `border-focus`: `#60A5FA`
- **Phản hồi & Trạng thái ATS (Feedback & ATS Status):**
  * `status-success`: `#34D399`
  * `status-warning`: `#FBBF24`
  * `status-danger`: `#F87171`
  * `status-info`: `#38BDF8`

---

## 3. Kiểu chữ (Typography)
- **Họ Phông chữ Chính:** Bộ phông chữ hệ thống (`SF Pro Display / SF Pro Text` trên iOS, `Roboto` trên Android) hoặc `Inter / Plus Jakarta Sans`.
- **Tỷ lệ (Scale):**
  * `display`: 28px / In đậm (Bold) - Tiêu đề chào mừng, tỷ lệ phần trăm phù hợp.
  * `title`: 20px / Bán đậm (SemiBold) - Tiêu đề phân đoạn, chức danh công việc.
  * `body-lg`: 16px / Trung bình (Medium) - Tiêu đề thẻ, nhãn nút.
  * `body-md`: 14px / Thường (Regular) - Mô tả chính, đoạn trích sơ yếu lý lịch.
  * `caption`: 12px / Trung bình (Medium) - Thẻ tag, nhãn điểm số, chip trạng thái.

---

## 4. Thành phần & Quy tắc Bố cục (Components & Layout Rules)
- **Thẻ & Bề mặt (Cards & Surfaces):**
  * Độ bo góc (Border radius): `20px` đến `24px` cho các thẻ; `12px` đến `16px` cho các mục lồng bên trong.
  * Độ nổi (Elevation): Bóng đổ khuếch tán nhẹ (`shadow-md` với sắc xanh navy nhẹ ở chế độ sáng).
- **Điều hướng (Navigation):**
  * Thanh Tab dưới cùng dạng nổi: Thùng chứa dạng viên thuốc tách rời khỏi cạnh dưới màn hình (`borderRadius: 32px`, nền màu xanh navy `#0F1E36` ở chế độ sáng, `#162032` ở chế độ tối).
- **Huy hiệu & Nút tương tác (Interactive Badges & Buttons):**
  * Các nút hành động nhanh: Thùng chứa dạng tròn (`size: 48px`, `borderRadius: 24px`) với các biểu tượng màu đơn sắc hoặc màu xanh lam ở giữa.
  * Chỉ báo Điểm Phù hợp: Vòng tiến trình tròn hoặc huy hiệu với điểm số in đậm (ví dụ: `92% Độ phù hợp`).