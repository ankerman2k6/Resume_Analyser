# Hướng dẫn Backend triển khai API — Trang cá nhân ứng viên

Phiên bản: 1.1, ngày 20/10/2026. Người thực hiện: **lập trình viên Backend**. Trạng thái: đặc tả đề xuất để triển khai, không phải danh sách API đã hoàn thành.

## 1. Phạm vi và nguồn đối chiếu

- Giao diện: `frontend/src/pages/candiate/CandidateProfile.jsx`.
- Service hiện tại: `frontend/src/services/candidateService.js`.
- CSDL đích: file `cv_screening (1).json` do chủ dự án cung cấp, gồm JSON Schema của các collection trong database `cv_screening`.
- Bốn tab: `applications` (Việc làm đã ứng tuyển), `resumes` (CV đã tải lên), `career` (Kinh nghiệm & kỹ năng), `settings` (Cài đặt tài khoản).

Nhiệm vụ backend: triển khai endpoint, DTO, validation, xác thực, truy vấn và cập nhật MongoDB cho bốn tab. Đầu ra bàn giao gồm API hoạt động, tài liệu OpenAPI hoặc Postman collection, kiểm thử và hướng dẫn cấu hình storage/index/migration. Tài liệu này không giao nhiệm vụ sửa frontend. Các JSON ví dụ chỉ minh họa response, không dùng làm dữ liệu trả về cố định.

File đính kèm mô tả kiểu và trường bắt buộc; **không chứng minh quan hệ khóa ngoại, enum trạng thái, index hoặc quy tắc nghiệp vụ hiện có**. Những quy tắc được chọn dưới đây là đề xuất thống nhất FE/BE. Backend cần đối chiếu dữ liệu thật trước khi phát hành, đặc biệt quan hệ `candidateId` và enum; không âm thầm áp dụng hai cách hiểu khác nhau.

## 2. Phạm vi dữ liệu backend phải cung cấp

| Dữ liệu | Nguồn DB | Yêu cầu backend v1 |
|---|---|---|
| Họ tên, điện thoại, avatar, thành phố, quốc gia | `candidate_profiles` | Giữ |
| Email, trạng thái tài khoản, xác minh email | `users` | Giữ, chỉ đọc |
| Chức danh `profile.title` | Không có trong `candidate_profiles` | Không nhận/không trả; `cvs.title` là tên CV, không phải chức danh cá nhân |
| Bio `profile.bio` | Không có trong `candidate_profiles` | Bỏ; không lấy `cvs.summary` rồi lưu ngược thành bio |
| Trạng thái tìm việc `searchStatus` | Không có | Không nhận/không trả; không thay bằng `users.status` vì khác ý nghĩa |
| CV mặc định `isDefault` | Không có | Không tạo field hoặc endpoint đặt CV mặc định |
| Dung lượng `source.fileSize` | Không có trong schema `cvs` | Không trả trường này |
| Công ty, lương, địa điểm, loại công việc | `applications → jobs → companies` | Giữ |
| `company.logoCode` | Không có | Chỉ trả `companies.logoUrl`; thiếu ảnh trả null |
| Báo cáo AI | `cv_analyses` | Giữ, lấy bản mới nhất theo từng đơn |
| Lịch phỏng vấn | `interviews` | Giữ, không gán mọi cuộc họp online là Google Meet |
| Kinh nghiệm, kỹ năng, học vấn, chứng chỉ | Các mảng tương ứng trong `cvs` | Giữ, chọn CV để xem, không lưu “CV chính” |
| Các số liệu đầu trang | Aggregate DB | Giữ bằng số liệu tính thật, không thêm trường DB |
| `avgMatchScore` | Aggregate `cv_analyses` | Tính theo mục 5.2; chưa có phân tích trả null |
| Số năm kinh nghiệm | `skills.yearsOfExperience` là tùy chọn | Giữ giá trị 0; thiếu trả null, không tự điền 1 |
| Tên nghề, email, thành phố, ngành công ty mặc định cứng | Không phải dữ liệu của người dùng | Không sinh dữ liệu thay thế; áp dụng quy tắc null |

Phân biệt **không có trường DB** với **có thể tính từ DB**: tổng CV, tổng đơn và điểm trung bình vẫn giữ được bằng aggregate. Không cần thêm collection hoặc lưu số liệu giả.

## 3. Quy ước chung

### 3.1. HTTP, xác thực và quyền sở hữu

Base path: `/api`. Mọi endpoint yêu cầu header `Authorization: Bearer <access_token>`. Request JSON dùng `Content-Type: application/json`; upload nhận multipart có boundary. Response JSON dùng UTF-8. Response chứa hồ sơ, CV và đơn ứng tuyển đặt `Cache-Control: no-store`.

Backend xác minh JWT, lấy `users._id` từ subject (phù hợp `JwtService` hiện tại), nạp user và kiểm tra role `candidate`, status `active`. Role/status này là giá trị contract đề xuất; dữ liệu thực tế cần chuẩn hóa nếu đang dùng giá trị khác. Không lấy danh tính từ query/body/localStorage do FE gửi.

**Quy ước khóa ngoại v1:**

| Trường | Tham chiếu |
|---|---|
| `candidate_profiles.userId` | `users._id` |
| `applications.candidateId`, `cvs.candidateId` | `candidate_profiles._id` |
| `applications.jobId`, `applications.cvId` | `jobs._id`, `cvs._id` |
| `jobs.companyId` | `companies._id` |
| `cv_analyses.applicationId`, `interviews.applicationId` | `applications._id` |
| `cv_analyses.cvId`, `cv_analyses.jobId` | CV/job của chính đơn được phân tích |
| `applications.statusHistory[].changedBy` | `users._id` của người thao tác |

Schema không có foreign-key constraint. Nếu DB hiện lưu `candidateId = users._id`, BE phải migrate hoặc đổi đồng bộ quy ước ở toàn bộ API trước khi tích hợp. Tuyệt đối không thử cả hai ID để đoán quyền sở hữu.

Mỗi truy vấn đối tượng con phải kèm điều kiện owner đã resolve. ID đúng định dạng nhưng không tồn tại/thuộc người khác đều trả `404 RESOURCE_NOT_FOUND`, tránh lộ dữ liệu. Thiếu/hỏng/hết hạn token: `401`; user sai role/bị khóa: `403`. Không trả `passwordHash`, đường dẫn ổ đĩa server, ghi chú nội bộ HR hoặc thông tin người đặt lịch.

### 3.2. Kiểu, null và phân trang

- ObjectId trả dưới dạng chuỗi hex 24 ký tự, dùng tên `_id` thống nhất trong DTO Profile này; không trả `{ "$oid": ... }`.
- BSON date trả ISO 8601 UTC, ví dụ `2026-10-20T02:00:00.000Z`; không format thành chuỗi giờ địa phương.
- Các ngày trong CV vốn là **string** (`experience.startDate`, `education.endDate`...) giữ nguyên chuỗi; không ép thành BSON date hoặc tự đoán ngày/tháng.
- Trường scalar tùy chọn thiếu/rỗng trả `null`; mảng thiếu trả `[]`. Trường bắt buộc sai kiểu trong dữ liệu cũ phải được xử lý như lỗi dữ liệu, không tạo giá trị giả.
- Object quan hệ không còn tồn tại trả `null`, vẫn giữ ID tham chiếu và đơn gốc. Không làm mất đơn khi `$lookup` không có kết quả.
- Mọi GET không có body. Query không được hỗ trợ hoặc sai giá trị trả `400 VALIDATION_ERROR`.
- Danh sách dùng `page` bắt đầu từ `0`, mặc định `0`; `size` mặc định `10`, từ `1..100`, số nguyên. Sort cố định được mô tả ở mỗi API, không nhận sort tùy ý.
- Envelope: `{ content: T[], page, size, totalElements, totalPages, last }`, tương thích cấu trúc `PageResponse` hiện có. `totalPages = ceil(totalElements / size)`. Không có bản ghi: `content: []`, `totalElements: 0`, `totalPages: 0`, `last: true`. Trang vượt cuối trả mảng rỗng và `last: true`.
- Thành công một đối tượng trả DTO trực tiếp, không bọc `data`. `204` không có body.

### 3.3. Lỗi thống nhất

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Thông tin hồ sơ chưa hợp lệ.",
  "errors": { "fullName": "Họ tên không được để trống." },
  "requestId": "req-example-001"
}
```

`code`, `message`, `errors`, `requestId` luôn có; không có lỗi field thì `errors: {}`. Giữ code ổn định để client xử lý lỗi. Không trả stacktrace.

| HTTP | Code | Khi nào |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Body, query, ObjectId sai; field không cho phép |
| 401 | `UNAUTHENTICATED` | Token thiếu/không hợp lệ/hết hạn |
| 403 | `FORBIDDEN` | Role hoặc trạng thái tài khoản không được phép |
| 404 | `PROFILE_NOT_FOUND` | Chưa tạo hồ sơ ứng viên |
| 404 | `RESOURCE_NOT_FOUND` | Đơn/CV không có hoặc không thuộc user |
| 404 | `CV_FILE_NOT_FOUND` | CV có record nhưng không có tệp xem được |
| 409 | `APPLICATION_NOT_WITHDRAWABLE` | Đơn không còn ở trạng thái được rút |
| 409 | `CV_IN_USE` | CV đang được đơn/phân tích tham chiếu |
| 413 | `FILE_TOO_LARGE` | File vượt giới hạn upload |
| 415 | `UNSUPPORTED_FILE_TYPE` | Không phải PDF hợp lệ |
| 502 | `FILE_STORAGE_UNAVAILABLE` | Không lấy được tệp từ storage |
| 500 | `INTERNAL_ERROR` | Lỗi server, không fallback mock |

## 4. Danh mục API

Tất cả đường dẫn dưới đây là đầy đủ, không nối thêm `/api` lần nữa.

| Tab/khu vực | Method | Endpoint | Thành công | Mục đích |
|---|---|---|---|---|
| Dùng chung/settings | GET | `/api/candidates/me/profile` | 200 ProfileDTO | Hero và thông tin tài khoản |
| Settings/modal | PUT | `/api/candidates/me/profile` | 200/201 ProfileDTO | Lưu/tạo lần đầu phần hồ sơ được sửa |
| Dùng chung | GET | `/api/candidates/me/stats` | 200 StatsDTO | Tổng số và điểm AI thật |
| Applications | GET | `/api/candidates/me/applications` | 200 Page<ApplicationDTO> | Danh sách, lọc và thông tin join |
| Applications | POST | `/api/candidates/me/applications/{applicationId}/withdraw` | 200 ApplicationDTO | Rút đơn, giữ lịch sử |
| Resumes | GET | `/api/candidates/me/cvs` | 200 Page<CvSummaryDTO> | Danh sách CV |
| Resumes | GET | `/api/candidates/me/cvs/{cvId}/file` | 200 binary PDF | Xem tệp sau kiểm tra quyền |
| Resumes | DELETE | `/api/candidates/me/cvs/{cvId}` | 204 | Xóa CV chưa được sử dụng |
| Career | GET | `/api/candidates/me/career` | 200 CareerDTO | Nội dung trích xuất từ một CV |
| Luồng `/cv` liên quan | POST | `/api/resumes/upload` | 201 CvSummaryDTO | Upload PDF vào CSDL đích `cvs` |

V1 không bao gồm tạo đơn ứng tuyển mới hoặc API chi tiết tin tuyển dụng. ApplicationDTO phải chứa đủ dữ liệu job/company đã liệt kê để client không cần gọi bổ sung cho từng đơn.

## 5. Dữ liệu dùng chung: hồ sơ và thống kê

### 5.1. GET `/api/candidates/me/profile`

Không query, không body. Join `candidate_profiles.userId = authenticated users._id`.

Response `200` — ProfileDTO:

```json
{
  "_id": "670000000000000000000002",
  "userId": "670000000000000000000001",
  "fullName": "Nguyễn Minh An",
  "email": "an@example.com",
  "phone": "0901234567",
  "avatarUrl": null,
  "location": { "city": "Hà Nội", "country": "Việt Nam" },
  "accountStatus": "active",
  "emailVerified": true,
  "createdAt": "2026-10-01T02:00:00.000Z",
  "updatedAt": "2026-10-20T02:00:00.000Z"
}
```

Tất cả key trong ví dụ luôn xuất hiện. `_id`, `userId`, `email`, `accountStatus` là string; `emailVerified` boolean; `createdAt`, `updatedAt` là date-time. `fullName`, `phone`, `avatarUrl`, `location.city/country` có thể `null` khi DB chứa chuỗi rỗng. `location` luôn là object. Email/status/verified lấy từ `users`; các trường còn lại từ `candidate_profiles`. `createdAt` là ngày tạo profile, không phải ngày tạo tài khoản.

Chưa có profile: `404 PROFILE_NOT_FOUND`. Thông tin tài khoản vẫn được cung cấp qua `GET /api/auth/me` hiện có. Những API danh sách/stats/career trả rỗng như quy định riêng.

### 5.2. GET `/api/candidates/me/stats`

Không query/body. Response `200` — StatsDTO:

```json
{
  "cvCount": 2,
  "applicationCount": 5,
  "upcomingInterviewCount": 1,
  "avgMatchScore": 78.5,
  "analyzedApplicationCount": 2,
  "applicationCounts": {
    "all": 5,
    "applied": 1,
    "reviewing": 1,
    "interview": 1,
    "accepted": 1,
    "rejected": 0,
    "withdrawn": 1
  }
}
```

- Count là integer không âm; `avgMatchScore` là number hoặc `null`. Tất cả key luôn có.
- `cvCount`: số record `cvs` của candidate, bao gồm CV tải lên và CV tạo từ mẫu.
- `applicationCount` và `applicationCounts.all`: tất cả đơn của candidate, gồm đơn đã rút. Không phụ thuộc filter/page đang mở.
- `reviewing`: gộp `reviewing + shortlisted`; `interview`: đơn ở trạng thái `interview_scheduled`; các key còn lại đếm đúng status tương ứng. Các nhóm là phân hoạch, tổng các nhóm bằng `all`.
- `upcomingInterviewCount`: số **record interviews** có `status = scheduled` và `scheduledAt >= thời điểm server xử lý`, thuộc đơn của candidate và đơn không ở `withdrawn/rejected/accepted`. Một đơn có hai lịch hợp lệ được đếm hai. Số này có thể khác số đơn trong filter Phỏng vấn.
- `avgMatchScore`: lấy analysis mới nhất của từng đơn chưa rút, trung bình `scores.overall`, làm tròn một chữ số thập phân. Thiếu analysis không tính là 0. Không có analysis hợp lệ: `null`; `analyzedApplicationCount = 0`. Điểm 0 vẫn là điểm hợp lệ.
- “Mới nhất”: `analyzedAt DESC, _id DESC`. Chỉ tính analysis khớp cả `applicationId`, `cvId`, `jobId` của đơn. Không đếm nhiều lần khi một đơn chạy AI lại.
- Chưa có profile: tất cả count bằng 0 và điểm `null`.

## 6. Tab 1 — Việc làm đã ứng tuyển

### 6.1. GET `/api/candidates/me/applications`

Query: `page`, `size` theo quy ước chung và `filter` mặc định `all`.

| filter | Điều kiện status |
|---|---|
| `all` | Tất cả, gồm đã rút |
| `applied` | `applied` |
| `reviewing` | `reviewing`, `shortlisted` |
| `interview` | `interview_scheduled` |
| `accepted` | `accepted` |
| `rejected` | `rejected` |
| `withdrawn` | `withdrawn` |

Ví dụ: `GET /api/candidates/me/applications?filter=reviewing&page=0&size=10`.

Sort: `appliedAt DESC, _id DESC`. `totalElements` đếm sau filter, trước pagination. Chưa có profile hoặc chưa nộp đơn: Page rỗng. BE phân trang đơn trước khi join; tránh nhân dòng do nhiều analysis/interview. Các trường join trả dữ liệu hiện tại, không phải snapshot lúc nộp (schema không có snapshot).

Response `200`:

```json
{
  "content": [
    {
      "_id": "670000000000000000000005",
      "cvId": "670000000000000000000003",
      "jobId": "670000000000000000000004",
      "status": "reviewing",
      "appliedAt": "2026-10-18T02:00:00.000Z",
      "updatedAt": "2026-10-19T02:00:00.000Z",
      "canWithdraw": false,
      "job": {
        "_id": "670000000000000000000004",
        "title": "Frontend Developer",
        "employmentType": "full_time",
        "salary": { "min": 15000000, "max": 25000000, "currency": "VND", "negotiable": false },
        "location": { "address": "", "city": "Hà Nội", "country": "Việt Nam", "remote": true }
      },
      "company": {
        "_id": "670000000000000000000006",
        "name": "Công ty Ví dụ",
        "industry": "Công nghệ thông tin",
        "logoUrl": null
      },
      "aiAnalysis": {
        "_id": "670000000000000000000007",
        "analyzedAt": "2026-10-19T01:00:00.000Z",
        "overallScore": 80,
        "scores": { "overall": 80, "skills": 85, "experience": 75, "education": 80, "projects": 80, "certificates": 70 },
        "recommendation": "Phù hợp với yêu cầu kỹ năng của vị trí.",
        "matchedSkills": ["React"],
        "missingSkills": ["Docker"],
        "strengths": ["Có dự án frontend thực tế"],
        "weaknesses": ["Chưa thể hiện kinh nghiệm triển khai"]
      },
      "interview": null
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

**ApplicationDTO:** tất cả key ở ví dụ luôn có. ID/status là string; thời gian là date-time; `canWithdraw` boolean tính từ `status === applied`. `job`, `company`, `aiAnalysis`, `interview` là object hoặc `null`. Không trả toàn bộ document DB.

- `job`: join `applications.jobId`. Salary min/max là số nguyên, currency string, negotiable boolean; location.remote boolean. Các chuỗi location rỗng chuẩn hóa thành `null`. Thiếu salary trả `salary: null`, không tự gán negotiable hoặc mức lương. Loại công việc hỗ trợ `full_time`, `part_time`, `internship`, `contract`; giá trị khác giữ nguyên, không tự chuyển thành part_time.
- `company`: join từ `job.companyId`; thiếu job/company thì object tương ứng `null`. Không dùng “Tên công ty”, “Công nghệ thông tin” để thay dữ liệu thiếu.
- `aiAnalysis`: bản mới nhất theo quy tắc mục 5.2. `overallScore` là alias của `scores.overall`, bắt buộc bằng nhau. Sáu score integer 0..100 là thang điểm **đề xuất API**, cần kiểm chứng pipeline AI hiện có trước tích hợp, không tự clamp dữ liệu sai. Array string luôn trả `[]` khi không có phần tử. `recommendation` là string lấy nguyên từ DB. Không có analysis trả `null`, không tạo score 0. Trả đầy đủ báo cáo ngay trong object này, **không cần endpoint riêng**.
- `interview`: chỉ trả khi đơn `interview_scheduled`; lấy lịch `scheduled` sắp tới gần nhất, sort `scheduledAt ASC, _id ASC`. Nếu không còn lịch sắp tới thì lấy lịch `scheduled` gần nhất đã qua, sort `scheduledAt DESC, _id DESC`; không lấy lịch `cancelled/completed`. Không có lịch phù hợp trả `null`.

InterviewDTO khi có lịch:

```json
{
  "_id": "670000000000000000000008",
  "scheduledAt": "2026-10-25T02:00:00.000Z",
  "durationMinutes": 45,
  "mode": "online",
  "location": null,
  "meetingLink": "https://meet.example.com/example-room",
  "status": "scheduled"
}
```

`durationMinutes` integer dương; `mode`: `online|offline`; `status`: `scheduled|completed|cancelled` là enum đề xuất cần chuẩn hóa. `location`, `meetingLink` string hoặc `null`; chỉ trả meetingLink nếu là URL HTTPS hợp lệ, nếu không trả null. Không trả `notes` vì schema chưa phân biệt ghi chú nội bộ và ghi chú công khai. Không cấp API sửa lịch hoặc cập nhật status tuyển dụng cho ứng viên.

### 6.2. POST `/api/candidates/me/applications/{applicationId}/withdraw`

Không query, không body. Thay cho `DELETE /applications/{id}` đang được mock service gọi: rút đơn là đổi trạng thái, không xóa đơn khỏi DB.

Quy tắc v1: chỉ rút khi `status = applied`. Cập nhật atomically trên cùng document với điều kiện `_id + candidateId + status`:

1. Set `status = withdrawn`, `updatedAt = serverNow`.
2. Push `statusHistory` một phần tử `{ status: "withdrawn", changedAt: serverNow, changedBy: authenticatedUserId, note: "Ứng viên rút đơn" }`.
3. Không xóa application, CV, analysis hoặc lịch sử.

Trả `200 ApplicationDTO` như mục 6.1, `status: withdrawn`, `canWithdraw: false`, `interview: null`. Gọi lại cho đơn đã `withdrawn` trả 200 trạng thái hiện tại, không thêm history lần hai. Đơn chuyển sang trạng thái khác trong lúc thao tác: `409 APPLICATION_NOT_WITHDRAWABLE`. Kiểm tra lặp lại quyền owner trước xử lý idempotency. Các GET sau đó phải phản ánh trạng thái mới, cả danh sách và thống kê.

Enum status ứng tuyển đề xuất: `applied`, `reviewing`, `shortlisted`, `interview_scheduled`, `accepted`, `rejected`, `withdrawn`. Schema chỉ khai string nên `withdrawn` không cần thêm field, nhưng phải cập nhật enum/validation nghiệp vụ nếu backend đang giới hạn.

## 7. Tab 2 — CV của bạn

### 7.1. GET `/api/candidates/me/cvs`

Query chỉ `page`, `size`. Sort `createdAt DESC, _id DESC`. Lọc theo candidate đã xác thực. Chưa có profile/CV trả Page rỗng.

Response `200 Page<CvSummaryDTO>`, ví dụ item:

```json
{
  "_id": "670000000000000000000003",
  "title": "CV Frontend Developer",
  "source": { "type": "upload", "fileName": "cv-frontend.pdf", "mimeType": "application/pdf" },
  "parseInfo": { "status": "completed", "parsedAt": "2026-10-18T01:00:00.000Z", "parserVersion": "parser-v1" },
  "skills": [ { "name": "React", "category": "technical", "level": "intermediate", "yearsOfExperience": 2 } ],
  "createdAt": "2026-10-18T01:00:00.000Z",
  "updatedAt": "2026-10-18T01:00:00.000Z",
  "canViewFile": true,
  "canDelete": false,
  "deleteBlockedReason": "CV_IN_USE"
}
```

Tất cả key luôn có. `_id/title` string; `source` object gồm 3 string; `parseInfo` object; `skills` array SkillDTO; thời gian date-time. `canViewFile/canDelete` boolean; `deleteBlockedReason` là `CV_IN_USE` hoặc `null`.

- `source.type`: đề xuất `upload|template`. Upload lưu `upload`; danh sách trả mọi nguồn CV thuộc candidate, không tự chuyển template thành upload.
- `parseInfo.status`: đề xuất `pending|processing|completed|failed`. Dữ liệu enum thật cần kiểm chứng trước phát hành. `parsedAt/parserVersion` trả `null` nếu chưa chạy xong/chưa có giá trị.
- `canViewFile`: có tham chiếu file hợp lệ trong `source.fileUrl` và MIME PDF; không đảm bảo storage luôn online. GET file vẫn có thể báo lỗi.
- `canDelete`: không có `applications.cvId` hoặc `cv_analyses.cvId` tham chiếu CV, bao gồm đơn đã rút. Đây là quyền tính từ dữ liệu, không phải field thêm vào DB. Khi xóa BE luôn kiểm tra lại.
- Không trả `source.fileUrl` lưu trữ gốc cho FE. Dùng endpoint file có kiểm tra owner.
- SkillDTO: `name/category` string bắt buộc; `level` string|null; `yearsOfExperience` integer không âm|null. Thiếu thông tin không mặc định là 1 năm.

### 7.2. GET `/api/candidates/me/cvs/{cvId}/file`

Không query/body. Response `200` là stream PDF, `Content-Type: application/pdf`, `Content-Disposition: inline; filename="cv.pdf"; filename*=UTF-8''...` (BE encode/sanitize tên gốc), `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`.

Endpoint chỉ nhận Bearer token qua header Authorization, không nhận access token trong query. Kiểm tra owner trước khi mở stream; không redirect tới URL storage công khai bỏ qua xác thực.

BE resolve storage từ `cvs.source.fileUrl` đã lưu, không nhận URL tùy ý từ client. Chỉ đọc storage được cấu hình; không fetch URL bất kỳ. Thiếu file: 404; MIME không hỗ trợ: 415; storage tạm lỗi: 502. Response lỗi vẫn là JSON theo mục 3.3.

### 7.3. DELETE `/api/candidates/me/cvs/{cvId}`

Không query/body. Thành công `204`, không trả danh sách CV. Có tham chiếu đơn/phân tích: `409 CV_IN_USE`, không xóa dữ liệu. ID không có/không thuộc owner: 404 (kể cả lần gọi lại sau xóa thành công).

BE phải bảo vệ race giữa xóa CV và tạo đơn/analysis: tất cả luồng tham chiếu và xóa dùng cùng cơ chế đồng bộ theo CV hoặc transaction có ghi khóa trên cùng bản ghi CV. Chỉ “đếm reference rồi xóa” bằng hai truy vấn độc lập là không đủ. Không xóa cascade hồ sơ đã nộp. Chỉ dọn file sau khi xóa DB thành công và file không còn được dùng; lỗi dọn storage cần retry phía backend, không trả thành công giả khi DB chưa xóa. Các GET list/stats/career sau đó phải đọc dữ liệu đã cập nhật.

### 7.4. POST `/api/resumes/upload` — phụ thuộc luồng tải CV

Giữ URL upload đang có, **đổi phần lưu và DTO sang collection `cvs`** để dữ liệu mới được truy vấn bằng các API Profile. Ghi rõ thay đổi response trong tài liệu bàn giao và kế hoạch tương thích cho client đang dùng API cũ.

Request `multipart/form-data`, đúng một field `file` kiểu binary PDF; không nhận candidateId/userId. Giới hạn đề xuất: 5 MiB = 5 × 1024 × 1024 bytes; file rỗng: 400, quá giới hạn: 413, nội dung không phải PDF: 415. BE kiểm tra nội dung thực, không chỉ extension. Chưa có profile: `404 PROFILE_NOT_FOUND`.

Response `201 CvSummaryDTO`, header `Location: /api/candidates/me/cvs/{cvId}/file`. Title lấy tên file an toàn (bỏ extension), `source.type = upload`, `templateId = null`; IDs/timestamps tạo phía server. Lưu `source.fileName/fileUrl/mimeType` đầy đủ. Không dùng request tạo profile hoặc upload để giả định danh tính từ nội dung CV.



## 8. Tab 3 — Kinh nghiệm & kỹ năng

### GET `/api/candidates/me/career`

Query duy nhất `cvId` (ObjectId, tùy chọn). Có cvId: kiểm tra owner và lấy đúng CV, không được fallback sang CV khác nếu sai ID. Không có cvId: chọn CV mới nhất theo `createdAt DESC, _id DESC` trong **toàn bộ CV của candidate**, không chỉ trang CV FE đang mở; không lọc bỏ CV parse lỗi để tránh trình bày dữ liệu cũ như dữ liệu mới.

Đây chỉ là lựa chọn mặc định khi đọc, **không ghi `isDefault` vào DB**. Luôn trả thông tin CV nguồn trong CareerDTO. V1 chỉ có GET career, không triển khai PUT/PATCH nội dung trích xuất.

Response `200` — CareerDTO:

```json
{
  "cv": {
    "_id": "670000000000000000000003",
    "title": "CV Frontend Developer",
    "fileName": "cv-frontend.pdf",
    "parseInfo": { "status": "completed", "parsedAt": "2026-10-18T01:00:00.000Z", "parserVersion": "parser-v1" }
  },
  "skills": [ { "name": "React", "category": "technical", "level": null, "yearsOfExperience": 0 } ],
  "experience": [
    {
      "position": "Frontend Developer", "company": "Công ty Ví dụ", "location": "Hà Nội",
      "employmentType": "full_time", "startDate": "2025-01", "endDate": null, "current": true,
      "description": "Phát triển giao diện web.", "achievements": ["Xây dựng thư viện giao diện"], "technologies": ["React"]
    }
  ],
  "education": [
    {
      "degree": "Cử nhân", "major": "Công nghệ thông tin", "institution": "Đại học Ví dụ",
      "startDate": "2021", "endDate": "2025", "status": "graduated",
      "gpa": { "value": 3.2, "scale": 4 }, "description": null
    }
  ],
  "certificates": [
    {
      "name": "Chứng chỉ Ví dụ", "issuer": "Đơn vị Ví dụ", "issueDate": "2025-06",
      "credentialId": "EXAMPLE-001", "credentialUrl": null, "expirationDate": null
    }
  ]
}
```

Tất cả key xuất hiện như ví dụ; map trực tiếp từ một document `cvs`, không gộp CV gây lặp kinh nghiệm.

| DTO | Kiểu dữ liệu và quy tắc |
|---|---|
| `cv` | Object gồm `_id/title/fileName` string, parseInfo như mục 7; `null` nếu chưa có CV |
| `skills[]` | SkillDTO mục 7.1 |
| `experience[]` | position/company/location/employmentType/startDate/description string (chuỗi rỗng → null); endDate string|null; current boolean; achievements/technologies string[] |
| `education[]` | degree/major/institution/startDate/endDate/status/description string|null; gpa object `{value: number, scale: integer}` hoặc null |
| `certificates[]` | name/issuer/issueDate/credentialId/credentialUrl/expirationDate string|null; không đoán hạn chứng chỉ nếu thiếu |

Chưa có profile hoặc CV và không chỉ định cvId: `200 { "cv": null, "skills": [], "experience": [], "education": [], "certificates": [] }`. Có CV nhưng chưa parse được: trả đúng parseInfo và các mảng dữ liệu thật hoặc rỗng. Giữ current là boolean, không tự gán endDate khi chưa có ngày kết thúc. Trả certificates riêng từ `cvs.certificates`, không gộp vào education.

## 9. Tab 4 — Cài đặt tài khoản và modal sửa hồ sơ

Đọc bằng GET Profile mục 5.1. Chỉ cho ghi `fullName`, `phone`, `location.city`, `location.country`. Avatar đọc từ DB; endpoint đổi avatar nằm ngoài phạm vi v1. Email, trạng thái tài khoản và emailVerified chỉ đọc, không cho client ghi role/status/emailVerified.

### PUT `/api/candidates/me/profile`

Không query. Request JSON là toàn bộ **phần hồ sơ được phép sửa**, cả 4 giá trị bắt buộc phải có:

```json
{
  "fullName": "Nguyễn Minh An",
  "phone": "0901234567",
  "location": { "city": "Hà Nội", "country": "Việt Nam" }
}
```

Validation đề xuất ở tầng API (schema đính kèm chưa quy định độ dài):

| Field | Quy tắc |
|---|---|
| fullName | string, trim, 1..120 ký tự; không null |
| phone | string, trim; được rỗng để xóa; tối đa 30 ký tự, chỉ chữ số, `+`, khoảng trắng, `-`, `(`, `)`; có nội dung phải có ít nhất một chữ số |
| location | object chỉ có city và country, không null |
| city/country | string, trim; được rỗng, tối đa 120 ký tự; không tự điền quốc gia |

Body thiếu key/null/sai kiểu/không có field hợp lệ hoặc thêm key ngoài whitelist (`title`, `bio`, `searchStatus`, `avatarUrl`, `userId`, `stats`, `email`...) trả 400, không silently ignore. Trong DB lưu chuỗi rỗng thay vì null để phù hợp bsonType string; DTO GET chuẩn hóa rỗng thành null.

Đã có profile: update đúng 4 trường và `updatedAt`; giữ `_id`, `userId`, `avatarUrl`, `createdAt`. Trả `200 ProfileDTO` theo mục 5.1 với trạng thái đã lưu.

Chưa có profile: tạo `_id`, userId từ JWT, `avatarUrl: ""`, `createdAt/updatedAt = serverNow`, các trường từ body; trả `201 ProfileDTO`, header `Location: /api/candidates/me/profile`. Có unique index userId để hai request không tạo hai profile; duplicate-key race phải đọc/cập nhật lại profile cùng owner. GET tuyệt đối không tự tạo dữ liệu.

Lưu profile **không** ghi đè `cvs.personalInfo` hoặc kinh nghiệm của CV đã nộp. Chỉ trả thành công sau khi MongoDB xác nhận ghi; trả DTO theo dữ liệu đã lưu.

### Đăng xuất

Hiện `AuthContext.logout()` xóa token/user local trên thiết bị, chưa gọi API server. V1 giữ hành vi này; **không đặt POST logout giả** khi chưa có cơ chế thu hồi JWT. Token đã cấp vẫn còn hiệu lực đến hết hạn ở server; nếu yêu cầu thu hồi phiên ngay thì cần thiết kế quản lý phiên riêng. Đổi mật khẩu, đổi email, xóa tài khoản không có UI tương ứng ở trang này nên không thuộc contract.

## 10. Trình tự triển khai dành cho Backend

1. **Kiểm tra CSDL:** xác minh quan hệ candidateId, enum, validator và dữ liệu `resumes` cũ theo mục 13. Ghi rõ mapping/migration cần thực hiện.
2. **Tạo model và repository:** map đúng collection; dùng ObjectId cho truy vấn, date-time UTC cho BSON date, giữ string cho ngày tháng trong nội dung CV. Tạo index mục 11 sau khi kiểm tra dữ liệu trùng.
3. **Tạo DTO và validation:** ProfileDTO, StatsDTO, ApplicationDTO, InterviewDTO, CvSummaryDTO, CareerDTO và PageDTO. Áp dụng whitelist request và mẫu lỗi mục 3.3.
4. **Tạo lớp resolve candidate:** lấy user từ Authentication, kiểm tra quyền/trạng thái, resolve profile theo userId. Tái sử dụng tại mọi service; phân biệt endpoint trả rỗng và endpoint yêu cầu profile tồn tại.
5. **Triển khai profile GET/PUT:** kiểm thử tạo lần đầu, cập nhật, unique userId và bảo toàn các trường không cho sửa.
6. **Triển khai CV list/file/career:** giới hạn truy vấn theo owner, đọc tệp qua storage service, chọn CV theo sort xác định. Không thêm API CV mặc định.
7. **Triển khai applications và stats:** lọc/phân trang trước lookup, chọn đúng analysis/interview, tính count và điểm trung bình trên toàn bộ tập dữ liệu đủ điều kiện.
8. **Triển khai mutation:** rút đơn atomically cùng statusHistory; xóa CV có kiểm tra reference và bảo vệ thao tác đồng thời. Kiểm thử idempotency/race trước bàn giao.
9. **Đồng bộ upload với collection cvs:** cấu hình storage/parser, kiểm tra PDF, xử lý validator và migration theo mục 7.4/11. Giữ tương thích API cũ nếu còn client sử dụng.
10. **Kiểm thử và bàn giao:** hoàn thành mục 12; cung cấp OpenAPI hoặc Postman collection cho toàn bộ endpoint, các biến baseUrl/token, cách chạy backend và cấu hình môi trường. Cung cấp script index/migration có hướng dẫn chạy và phục hồi; không kèm secret thật.

Phân tầng gợi ý: Controller nhận HTTP và validate DTO; Service xử lý quyền/nghiệp vụ; Repository thực hiện query/aggregate; Storage service xử lý tệp; DTO mapper chuẩn hóa ObjectId/date/null. Không để Controller trả trực tiếp Mongo entity.

## 11. Lưu ý triển khai backend với repository hiện tại

Hiện có `ResumeController` tại `/api/resumes` (GET list, GET /{id}, POST /upload), nhưng `Resume` đang map `@Document(collection = "resumes")` với `userId`, `filePath`, `uploadedAt`, `fileSize`... **Không trùng schema đích `cvs`**. Chỉ đổi URL FE sẽ không đủ.

Backend cần model/repository/DTO cho `candidate_profiles`, `applications`, `cvs`, `cv_analyses`, `interviews`, `companies` và join `jobs/users`. Với bản v1 này:

- API Profile mới dùng namespace candidates/me như bảng mục 4.
- `/api/resumes/upload` ghi CSDL đích `cvs`, trả DTO mới; công bố thay đổi response và kế hoạch tương thích trước phát hành.
- Các GET `/api/resumes` cũ không được Profile sử dụng. Nếu còn consumer cũ, giữ adapter tương thích trong thời gian chuyển đổi; không đổi shape lặng lẽ cho consumer khác.
- Dữ liệu `resumes` cũ cần kế hoạch migration riêng: resolve userId → profileId, map source/timestamps, tạo dữ liệu parse thật hoặc trạng thái failed phù hợp. Không tự coi record cũ đã được parse.
- Chỉ expose DTO whitelist; không serialize toàn bộ Mongo entity. Aggregate theo owner từ đầu; batch lookup thay vì gọi một truy vấn cho mỗi item.
- AI và nội dung CV trả dưới dạng chuỗi dữ liệu trong JSON. Chỉ công khai các trường analysis đã liệt kê; không kèm ghi chú nội bộ hoặc thông tin ngoài whitelist.

Index đề xuất (cần kiểm tra trùng lặp trước tạo unique, không suy ra đã tồn tại từ JSON):

| Collection | Index |
|---|---|
| candidate_profiles | `{userId: 1}` unique |
| cvs | `{candidateId: 1, createdAt: -1, _id: -1}` |
| applications | `{candidateId: 1, appliedAt: -1, _id: -1}` |
| applications | `{candidateId: 1, status: 1, appliedAt: -1, _id: -1}` |
| applications | `{cvId: 1}` |
| cv_analyses | `{applicationId: 1, analyzedAt: -1, _id: -1}` và `{cvId: 1}` |
| interviews | `{applicationId: 1, status: 1, scheduledAt: 1, _id: 1}` |

Không đặt unique(applicationId) cho interviews/analyses vì một đơn có thể có nhiều vòng phỏng vấn/lần phân tích. Không tự thêm unique(candidateId, jobId) khi chưa có chính sách nộp lại.

## 12. Checklist kiểm thử Backend

- User A không đọc/rút/xóa được tài nguyên user B, kể cả biết ObjectId.
- Token thiếu/hết hạn trả 401; tài khoản sai role/không active trả 403; lỗi DB không trả dữ liệu mẫu hoặc response thành công.
- User mới chưa có profile: profile GET 404, các danh sách rỗng, stats 0/null, PUT tạo 201 và đọc lại đúng dữ liệu.
- PUT hồ sơ rồi GET lại và đọc DB có cùng dữ liệu; field không được hỗ trợ bị từ chối; không sửa nhầm dữ liệu CV.
- CV list rỗng trả content rỗng; DTO không chứa fileSize/isDefault.
- Query cvId trong career trả đúng owner và đúng dữ liệu; 0 năm giữ nguyên 0; mảng thiếu chuẩn hóa thành [].
- Điểm 0, không có analysis, nhiều lần phân tích được xử lý khác nhau; avg dùng đúng một analysis mới nhất mỗi đơn đủ điều kiện.
- Stats/filter count không giảm theo page size; pagination/filter ổn định, trang vượt cuối hợp lệ.
- Nhiều interview không nhân đôi application; lịch hủy không được chọn vào InterviewDTO; kiểm thử riêng số lịch sắp tới và số đơn có status phỏng vấn.
- Rút đơn chỉ từ applied; gọi lặp không thêm history; race đổi trạng thái HR trả 409; đơn đã rút vẫn tồn tại.
- Xóa CV có reference trả 409; CV không có reference xóa 204; race tạo reference không để liên kết mồ côi.
- Xem file gửi Bearer token, trả PDF thực; storage lỗi có mã lỗi riêng; không lộ đường dẫn server/token trong URL.
- Upload PDF hợp lệ tạo record trong `cvs` và xuất hiện trong list; file vượt giới hạn/sai định dạng báo lỗi; parse thất bại không được giả thành completed.
- Job/company đã bị xóa không làm rơi đơn ứng tuyển khỏi danh sách.

## 13. Các điểm backend phải xác minh trước khi chốt v1

1. `candidateId` trong dữ liệu hiện tại trỏ tới profile hay user; áp một quy ước xuyên suốt mục 3.1.
2. Giá trị status thực tế của users/applications/interviews/parseInfo và thang điểm AI. Các enum/giới hạn trong tài liệu là đề xuất vì JSON chỉ khai kiểu.
3. Validator trong file đính kèm có đang được bật trên MongoDB không, đặc biệt timestamp parse và các nested required fields khi upload.
4. Storage tệp, migration collection `resumes` sang `cvs`, consumer của upload hiện tại và cơ chế bảo vệ race xóa CV.

Không tự thêm các trường ngoài phạm vi mục 2. Khi điều chỉnh contract, cập nhật phiên bản tài liệu và công bố thay đổi API trước phát hành.
