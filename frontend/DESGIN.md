# KONEK Frontend UI/UX Design Direction


## 1. Tinh thần giao diện

Giao diện của KONEK là một sản phẩm tuyển dụng và phân tích CV, ưu tiên:

- Nền sáng, sạch và dễ đọc trong light mode.
- Tương phản rõ giữa nền trang, surface, nội dung chính và màu thương hiệu.
- Màu xanh navy/xanh dương làm trục nhận diện và hành động chính.
- Bề mặt phẳng là mặc định; shadow và glass chỉ dùng cho các lớp cần tách khỏi nội dung.
- Typography sans-serif gọn, hiện đại; serif chỉ dùng cho các điểm nhấn có chủ đích.
- Các trạng thái thành công, cảnh báo, lỗi và thông tin dùng màu riêng, không dùng màu thương hiệu để thay thế.


## 3. Color system

### 3.1. Tailwind theme tokens

Các token trong `@theme` phục vụ tên màu/font của Tailwind:

| Token | Giá trị | Vai trò |
|---|---|---|
| `--color-brand-primary` | `#051A24` | Màu thương hiệu navy đậm |
| `--color-brand-dark` | `#0D212C` | Navy tối cho nền hoặc khối nhấn |
| `--color-brand-blue` | `#2563EB` | Xanh dương hành động |
| `--color-brand-border` | `#E2E8F0` | Viền trung tính |

### 3.2. Light mode

Light mode là theme mặc định:

| Token | Giá trị | Vai trò |
|---|---|---|
| `--bg-primary` | `#F4F7FB` | Nền trang |
| `--bg-surface` | `#FFFFFF` | Card, panel, surface chính |
| `--bg-subtle` | `#EDF2F7` | Nền phụ, trạng thái nhẹ |
| `--bg-input` | `#FFFFFF` | Nền ô nhập |
| `--brand-primary` | `#0F1E36` | Màu hành động chính/navy |
| `--brand-secondary` | `#2563EB` | Màu link, action phụ, focus |
| `--brand-accent` | `#E0F2FE` | Nền accent nhẹ |
| `--text-primary` | `#0F172A` | Tiêu đề và nội dung chính |
| `--text-secondary` | `#64748B` | Mô tả, metadata, placeholder |
| `--text-inverse` | `#FFFFFF` | Chữ trên nền màu đậm |
| `--border-subtle` | `#E2E8F0` | Viền mặc định |
| `--border-focus` | `#3B82F6` | Viền khi focus |

### 3.3. Dark mode

Dark mode dùng `[data-theme="dark"]`:

| Token | Giá trị |
|---|---|
| `--bg-primary` | `#0B1019` |
| `--bg-surface` | `#121A28` |
| `--bg-subtle` | `#162032` |
| `--bg-input` | `#162032` |
| `--brand-primary` | `#3B82F6` |
| `--brand-secondary` | `#60A5FA` |
| `--brand-accent` | `rgba(56, 189, 248, 0.15)` |
| `--text-primary` | `#F8FAFC` |
| `--text-secondary` | `#94A3B8` |
| `--text-inverse` | `#FFFFFF` |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` |
| `--border-focus` | `#60A5FA` |

Khi thêm component hỗ trợ dark mode, không dùng trực tiếp màu light mode. Component cần dùng cùng tên token để tự đổi theo `[data-theme="dark"]`.

## 4. Semantic colors

Các màu trạng thái dùng thống nhất trong toàn frontend:

| Token | Light | Dark | Ý nghĩa |
|---|---|---|---|
| `--status-success` | `#10B981` | `#34D399` | Thành công, hoàn tất, đang hoạt động |
| `--status-warning` | `#F59E0B` | `#FBBF24` | Cần chú ý, sắp hết hạn |
| `--status-danger` | `#EF4444` | `#F87171` | Lỗi, thất bại, hành động nguy hiểm |
| `--status-info` | `#0EA5E9` | `#38BDF8` | Thông tin, trạng thái trung tính có ích |

Màu trạng thái luôn đi kèm với chữ, icon hoặc nhãn. Không dùng màu là tín hiệu duy nhất để truyền đạt ý nghĩa.

## 5. Typography

### Font family

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

Font sans là lựa chọn mặc định cho body, label, button, navigation và dữ liệu.

Font serif dùng có chủ đích cho điểm nhấn:

```css
font-family: 'Instrument Serif', 'Playfair Display', Georgia, serif;
```

Class hiện có cho serif là `.font-serif-instrument`.

### Quy tắc sử dụng

- Body dùng `line-height: 1.5`.
- Button cơ bản dùng `14px`, `font-weight: 500`, `line-height: 20px`.
- Heading phân cấp bằng kích thước và font-weight, không đổi sang nhiều font khác nhau.
- Text chính dùng `--text-primary`.
- Text phụ, mô tả và metadata dùng `--text-secondary`.
- Text trên nền đậm dùng `--text-inverse`.
- Tránh dùng chữ uppercase hoặc letter-spacing rộng nếu không có vai trò rõ ràng.

## 6. Border radius

| Token | Giá trị | Dùng cho |
|---|---:|---|
| `--radius-sm` | `4px` | Control nhỏ, chi tiết nhỏ |
| `--radius-default` | `6px` | Button và control mặc định |
| `--radius-md` | `8px` | Input, card nhỏ, menu |
| `--radius-lg` | `12px` | Card và panel |
| `--radius-xl` | `20px` | Card lớn, section nổi bật |
| `--radius-2xl` | `24px` | Panel lớn hoặc modal |
| `--radius-full` | `9999px` | Avatar, badge, pill |

Không dùng `--radius-full` cho mọi component. Pill chỉ phù hợp với trạng thái, tag, avatar hoặc control có chủ đích.

## 7. Shadow và elevation

Light mode có ba mức shadow:

```css
--shadow-sm: 0 1px 3px rgba(15, 30, 54, 0.06);
--shadow-md: 0 4px 12px rgba(15, 30, 54, 0.08);
--shadow-lg: 0 10px 30px rgba(15, 30, 54, 0.15);
```

Quy tắc:

- `shadow-sm`: tách nhẹ card hoặc control khỏi nền.
- `shadow-md`: panel, menu hoặc khối cần nổi vừa phải.
- `shadow-lg`: modal, drawer hoặc lớp nổi quan trọng.
- Không đổ shadow lên mọi card trong cùng một màn hình.
- Dark mode đang đặt cả ba shadow thành `none`; khi thêm shadow cho dark mode cần có lý do rõ ràng.

## 8. Background effects

### Glass panel

`glass-panel` dùng cho panel cần hiệu ứng trong mờ nhẹ:

```css
background: rgba(255, 255, 255, 0.85);
backdrop-filter: blur(16px);
border: 1px solid rgba(226, 232, 240, 0.8);
```

`glass-dark` dùng cho bề mặt tối:

```css
background: rgba(13, 33, 44, 0.9);
border: 1px solid rgba(255, 255, 255, 0.1);
```

Glass là accent, không phải mặc định cho tất cả card, navbar và panel cùng lúc.

### Marquee

Landing page hiện có hai animation:

- `.animate-marquee`: chạy từ trái sang phải theo keyframe `marquee`, thời lượng `28s`.
- `.animate-marquee-reverse`: chạy chiều ngược lại, thời lượng `32s`.

Khi hover, animation dừng lại bằng `animation-play-state: paused`.

Chỉ dùng marquee cho nội dung có lý do trình bày dạng chuyển động ngang; không áp dụng cho dữ liệu chức năng hoặc nội dung người dùng cần đọc chính xác.

## 9. Button system

Button nền tảng `.btn` có:

```css
display: inline-flex;
align-items: center;
justify-content: center;
font-size: 14px;
font-weight: 500;
line-height: 20px;
padding: 10px 18px;
border-radius: var(--radius-default);
border: 1px solid transparent;
transition: all 0.2s ease-in-out;
```

### Primary

- Nền: `--brand-primary`.
- Chữ: `--text-inverse`.
- Viền: `--brand-primary`.
- Hover: đổi nền và viền sang `--brand-secondary`.
- Dùng cho hành động chính của khu vực.

### Secondary

- Nền trong suốt.
- Chữ và viền: `--brand-secondary`.
- Hover: nền `--brand-accent`.
- Dùng cho hành động phụ cần nhìn thấy rõ.

### Ghost

- Nền trong suốt.
- Chữ: `--text-primary`.
- Hover: nền `--bg-subtle`.
- Dùng cho hành động phụ hoặc control ít nhấn mạnh.

### Focus

Button có focus ring:

```css
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
```

Không loại bỏ focus state nếu chưa có một giải pháp accessibility tương đương.

## 10. Form và input

- Input dùng `--bg-input` làm nền.
- Viền mặc định dùng `--border-subtle`.
- Focus dùng `--border-focus`.
- Label và nội dung chính dùng `--text-primary`.
- Placeholder và mô tả dùng `--text-secondary`.
- Input thường dùng `--radius-md` hoặc `--radius-lg` tùy context.
- Không thêm icon vào input nếu icon không giúp người dùng hiểu hoặc thao tác nhanh hơn.
- Lỗi dùng `--status-danger`, đồng thời phải có câu chữ giải thích cách sửa.
- Form phải có trạng thái loading, error và success khi có hành động gửi/lưu.

## 11. Layout và surface

Thứ bậc surface mặc định:

```text
bg-primary
└── bg-surface
    └── bg-subtle / bg-input / accent state
```

Nguyên tắc:

- Nền trang dùng `--bg-primary`.
- Card, panel và khu nội dung chính dùng `--bg-surface`.
- Nền phụ hoặc trạng thái active nhẹ dùng `--bg-subtle`.
- Không dùng nhiều lớp shadow để thay thế cho hierarchy bằng spacing và màu nền.
- Card có nội dung liên quan nên dùng cùng radius, border và padding.
- Mobile và desktop có thể thay đổi layout, nhưng không thay đổi vai trò của token.

## 12. Theme switching

Dark mode được kích hoạt bằng:

```html
<html data-theme="dark">
```

Hoặc trên phần tử bao ngoài có selector tương ứng:

```html
<div data-theme="dark">...</div>
```

Component không nên tự đặt màu nền/chữ cố định nếu đã có semantic token tương ứng. Khi thêm token mới, cần bổ sung cả light và dark value.

## 13. Accessibility và interaction

- Mọi button/link phải có hành động thật hoặc được ghi rõ là chưa triển khai.
- Keyboard focus phải nhìn thấy được, đặc biệt trên button và form control.
- Không dùng màu làm tín hiệu duy nhất.
- Text trên nền màu cần đủ tương phản.
- Hover không được là trạng thái duy nhất; người dùng keyboard và mobile vẫn phải hiểu được trạng thái.
- Animation cần dừng được khi người dùng hover hoặc khi nội dung cần tập trung đọc.
- Không dùng animation liên tục cho phần tử không có ý nghĩa trạng thái.

## 14. Khi thêm UI mới

Trước khi tạo component mới:

1. Tìm component hoặc pattern tương tự trong `frontend/src/`.
2. Tái sử dụng token từ `src/index.css`.
3. Chọn đúng semantic role: primary, secondary, ghost, status hoặc surface.
4. Kiểm tra light mode, dark mode, loading, empty, error và focus state.
5. Kiểm tra màn hình hẹp và nội dung dài.
6. Không hard-code màu mới nếu một token hiện có đã diễn đạt đúng vai trò.

## 15. Source of truth

Các token nền tảng hiện được định nghĩa tại:

- [`src/index.css`](./src/index.css): color, font, radius, shadow, button và effect token.
- [`src/ultis/theme.js`](./src/ultis/theme.js): bảng theme bổ sung đang được sử dụng ở một số khu vực.

Khi hai nguồn có giá trị khác nhau, cần kiểm tra component đang dùng nguồn nào trước khi thay đổi. Không âm thầm đổi toàn bộ hệ thống chỉ để hợp nhất tên token.

