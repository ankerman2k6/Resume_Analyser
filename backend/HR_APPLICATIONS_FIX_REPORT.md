# Báo cáo sửa API HR Applications

## Nguyên nhân và bằng chứng

`JwtService.generateToken()` dùng `User.id` làm JWT subject. `JwtAuthenticationFilter` xác minh chữ ký/expiration, tìm User theo subject, kiểm tra active và lấy role từ database rồi đặt chính đối tượng User làm principal.

User không triển khai UserDetails/Principal và không override toString. Vì vậy `authentication.getName()` là `com.resumeanalyser.backend.model.User@...`, không phải email, username hay MongoDB ID. Controller cũ truyền chuỗi này vào ApplicationService; kiểm tra ObjectId thất bại và ném IllegalArgumentException. GlobalExceptionHandler cũ không xử lý exception này, dẫn tới HTTP 500.

Trước sửa đã chạy test sử dụng Controller và Service cũ với principal User đúng như JWT filter: getName() bằng user.toString(), khác user.id; Controller ném IllegalArgumentException và chưa gọi bất kỳ repository nào. Test đó PASS, xác nhận đường lỗi trước khi sửa. Phiên bản test hiện tại kiểm tra Controller đã truyền đúng user.id.

Không đọc log hoặc dữ liệu của ứng dụng production để khẳng định stack trace của request cụ thể ở cổng 8080. Đường lỗi trên được tái hiện trực tiếp từ code hiện có.

Lỗi thứ hai: schema tại ../../database/database/model/cv_screening.json yêu cầu statusHistory, nhưng Application cũ không có trường này. MongoRepository.save() thay thế document, có thể bỏ lịch sử và các trường chưa được map; validator có thể từ chối document thiếu statusHistory. Đây là lỗi độc lập của PATCH, được xử lý bằng cập nhật theo trường.

Các ID trong schema là BSON ObjectId. findByJobId(ObjectId) đúng tên trường và kiểu dữ liệu. Status trong model là String, tương thích interview/shortlisted chữ thường; không có enum gây MappingException. Không cần sửa JwtService, JwtAuthenticationFilter, SecurityConfig, Job, JobRepository, AuthService hoặc JobService. Không có file service/UpdateApplicationStatusRequest.java trong workspace hiện tại; DTO được Controller import nằm ở package dto.

## File và thay đổi

Các đường dẫn dưới đây tương đối từ backend.

- src/main/java/com/resumeanalyser/backend/controller/HrApplicationController.java: lấy ID từ User principal bằng instanceof, kiểm tra authentication; bật @Valid cho PATCH.
- src/main/java/com/resumeanalyser/backend/service/ApplicationService.java: validate ObjectId và sáu status; kiểm tra tồn tại/quyền sở hữu Job trước truy vấn hoặc cập nhật; phân biệt 400, 401, 403, 404; xử lý application.jobId null.
- src/main/java/com/resumeanalyser/backend/dto/UpdateApplicationStatusRequest.java: @NotBlank và @Pattern cho sáu trạng thái.
- src/main/java/com/resumeanalyser/backend/model/Application.java: bổ sung statusHistory theo schema, serialize ObjectId thành chuỗi hex như Job.
- src/main/java/com/resumeanalyser/backend/repository/ApplicationRepository.java: nối repository fragment cập nhật status.
- src/main/java/com/resumeanalyser/backend/repository/ApplicationStatusRepository.java: khai báo cập nhật trạng thái trả về Application đã cập nhật.
- src/main/java/com/resumeanalyser/backend/repository/ApplicationStatusRepositoryImpl.java: findAndModify với _id + jobId; $set status/updatedAt và $push statusHistory trong một thao tác atomic; không upsert, không thay thế document.
- src/main/java/com/resumeanalyser/backend/exception/NotFoundException.java: biểu diễn tài nguyên không tồn tại.
- src/main/java/com/resumeanalyser/backend/exception/GlobalExceptionHandler.java: ánh xạ IllegalArgumentException -> 400, NotFoundException -> 404; giữ handler 401/403 hiện có.
- src/test/java/com/resumeanalyser/backend/service/ApplicationAuthenticationRegressionTests.java: hồi quy principal.getName() và cách lấy User.id.
- src/test/java/com/resumeanalyser/backend/service/ApplicationServiceTests.java: Mockito repository, validate, ownership, not-found, sáu trạng thái, thời gian và không gọi save thay thế document.
- src/test/java/com/resumeanalyser/backend/controller/HrApplicationControllerTests.java: @WebMvcTest, SecurityConfig/JWT filter thật, repository User và service mock, token ký bằng khóa test; kiểm tra HTTP status, JSON, DTO validation và role từ DB.
- src/test/java/com/resumeanalyser/backend/controller/HrApplicationsMongoIntegrationTests.java: @SpringBootTest random port, HTTP thật bằng JDK HttpClient, JWT test hợp lệ, repository và MongoDB thật, validator, kiểm tra dữ liệu sau PATCH.
- src/test/resources/applications-schema.json: bản sao schema applications hiện có để bật validator trong MongoDB test.
- src/test/java/com/resumeanalyser/backend/BackendApplicationTests.java: override Mongo URI sang địa chỉ test không kết nối production; test mapping hiện có không cần Mongo server.

Security giữ ROLE_RECRUITER cho /api/hr/**. Không có JWT -> 401; role khác recruiter -> 403. Recruiter đúng role nhưng không sở hữu Job -> 403. Missing resource -> 404. ID/status/body sai -> 400. Status cập nhật được chấp nhận: pending, reviewing, shortlisted, interview, accepted, rejected. Lịch sử cũ applied/screening vẫn giữ nguyên.

Lịch sử mới gồm status, changedAt, changedBy (ObjectId của recruiter), không thêm note khi request không có note. changedAt và updatedAt dùng cùng một Instant. Các trường jobId, candidateId, cvId, appliedAt, dữ liệu phân tích và nội dung lịch sử cũ được giữ nguyên trong database, kể cả các trường chưa được model khai báo.

## Kiểm thử đã chạy

Máy có Java 21.0.10; mvn không nằm trên PATH nên dùng Maven Wrapper của project (Maven 3.9.16), tương đương các lệnh Maven được yêu cầu. Không dùng -DskipTests.

- Trước sửa: ./mvnw.cmd -Dtest=ApplicationAuthenticationRegressionTests test -> PASS (1 test tái hiện lỗi cũ).
- ./mvnw.cmd clean compile -> BUILD SUCCESS.
- ./mvnw.cmd test với RESUME_TEST_MONGO_URI -> BUILD SUCCESS, 56 tests, 0 failures, 0 errors, 0 skipped.

| Test suite | Số test | Kết quả |
| --- | ---: | --- |
| BackendApplicationTests | 2 | PASS |
| HrApplicationControllerTests | 10 | PASS |
| HrApplicationsMongoIntegrationTests | 6 | PASS |
| JwtAuthenticationTests (có sẵn) | 21 | PASS |
| ApplicationAuthenticationRegressionTests | 1 | PASS |
| ApplicationServiceTests | 16 | PASS |

Integration test khởi chạy Spring Boot trên random port và gửi GET/PATCH HTTP thật; không phải chỉ MockMvc. MongoDB 8.2 chạy riêng tại 127.0.0.1:27028, dbpath trong thư mục TEMP mới. Mỗi lần chạy tạo database resume_analyser_test_<UUID> và chỉ xóa database test này sau khi hoàn tất. Instance test đã được dừng. Instance hiện có tại 27017 và ứng dụng tại 8080 không bị sửa/dừng.

Bao phủ GET 200 có dữ liệu, 200 [], 400 ID sai, 404 không tồn tại, 403 không sở hữu, 401 thiếu/sai JWT. PATCH bao phủ 200, 400 ID/status sai, 404 không tồn tại, 403 không sở hữu, 401 thiếu/sai JWT, updatedAt, cả sáu status, append history và bảo toàn dữ liệu khác. WebMvc test bổ sung JSON lỗi, status thiếu/null/rỗng, role DB khác JWT, serialization và principal sai kiểu.

Không có test yêu cầu nào chưa chạy. Không chạy Testcontainers vì Docker daemon không hoạt động; đã dùng MongoDB test riêng thay thế. Không gửi request vào ứng dụng đang chạy ở 8080 với dữ liệu hiện có.

Log: target/test-run.log. Báo cáo từng suite: target/surefire-reports/.

## Chạy lại test

Từ thư mục backend, có thể chạy compile/unit/MVC test mà không cần MongoDB test:

```powershell
./mvnw.cmd clean compile
./mvnw.cmd test
```

Khi không có RESUME_TEST_MONGO_URI, chỉ suite Mongo integration được JUnit đánh dấu skipped, các suite khác vẫn chạy. Để chạy tất cả, khởi chạy một mongod riêng rồi đặt URI đúng định dạng dưới đây. Test tự thêm UUID vào tên database, không dùng database production.

```powershell
$testDbPath = Join-Path $env:TEMP ('resume-analyser-test-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory $testDbPath | Out-Null
$testMongo = Start-Process 'C:/Program Files/MongoDB/Server/8.2/bin/mongod.exe' -ArgumentList @('--dbpath', $testDbPath, '--bind_ip', '127.0.0.1', '--port', '27028', '--logpath', (Join-Path $testDbPath 'mongod.log')) -WindowStyle Hidden -PassThru
$env:RESUME_TEST_MONGO_URI = 'mongodb://127.0.0.1:27028/resume_analyser_test'
try {
    ./mvnw.cmd test
} finally {
    Stop-Process -Id $testMongo.Id
    Remove-Item Env:RESUME_TEST_MONGO_URI
}
```

## Test bằng Postman

Khởi động lại backend với code đã sửa. Dùng môi trường test và recruiter active có role recruiter, Job thuộc recruiter đó, Application trỏ tới Job đó. Dữ liệu integration test tự dọn sau khi chạy nên không dùng lại các ID từ test suite.

1. POST {{baseUrl}}/api/auth/login, Content-Type application/json, body chứa email/password của recruiter test. Lấy trường token trong response và lưu thành biến jwt.
2. GET {{baseUrl}}/api/hr/jobs/{{jobId}}/applications; Authorization -> Bearer Token -> {{jwt}}. Mong đợi 200, mảng application hoặc []. Không truyền recruiterId từ client.
3. PATCH {{baseUrl}}/api/hr/applications/{{applicationId}}/status; cùng Bearer Token, Content-Type application/json, body {"status":"shortlisted"}. Mong đợi 200 và status/updatedAt/history mới.
4. Kiểm tra nhánh lỗi với ID sai -> 400; ObjectId hợp lệ nhưng không tồn tại -> 404; recruiter khác -> 403; bỏ Authorization -> 401; PATCH status invalid -> 400.

Ví dụ GET thành công (ID và thời gian minh họa):

```json
[
  {
    "id": "6ac15217f84ca0e8c243b011",
    "jobId": "6ac15217f84ca0e8c243b00e",
    "candidateId": "6ac15217f84ca0e8c243b012",
    "cvId": "6ac15217f84ca0e8c243b013",
    "status": "interview",
    "appliedAt": "2026-10-04T02:00:00Z",
    "updatedAt": "2026-10-04T05:00:00Z",
    "statusHistory": [
      {
        "status": "interview",
        "changedAt": "2026-10-04T05:00:00Z",
        "changedBy": "6ac15217f84ca0e8c243b014",
        "note": null
      }
    ]
  }
]
```

Ví dụ PATCH thành công cho application trên:

```json
{
  "id": "6ac15217f84ca0e8c243b011",
  "jobId": "6ac15217f84ca0e8c243b00e",
  "candidateId": "6ac15217f84ca0e8c243b012",
  "cvId": "6ac15217f84ca0e8c243b013",
  "status": "shortlisted",
  "appliedAt": "2026-10-04T02:00:00Z",
  "updatedAt": "2026-10-11T06:00:00Z",
  "statusHistory": [
    {
      "status": "interview",
      "changedAt": "2026-10-04T05:00:00Z",
      "changedBy": "6ac15217f84ca0e8c243b014",
      "note": null
    },
    {
      "status": "shortlisted",
      "changedAt": "2026-10-11T06:00:00Z",
      "changedBy": "6ac15217f84ca0e8c243b014",
      "note": null
    }
  ]
}
```

Không commit/push, không vô hiệu hóa Spring Security, không ghi/xóa dữ liệu production.