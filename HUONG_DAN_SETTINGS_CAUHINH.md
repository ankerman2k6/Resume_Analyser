`# Resume Analyser

CI/CD setup, Jenkins prerequisites, GitHub webhook, deployment and troubleshooting:
[docs/CI-CD.md](docs/CI-CD.md).

# 1. Terminal chạy backend
cd "thư mục backend"

- chmod +x mvnw
- Nhập Gemini API key an toàn:

```read -s "GEMINI_API_KEY?Dán Gemini API key: "```
```export GEMINI_API_KEY```
```echo```

- Cấu hình JWT và model:

```export JWT_SECRET="jwt-authentication-test-secret-at-least-32-bytes```
```export GEMINI_MODEL="gemini-3.5-flash-lite"```
```export GEMINI_TIMEOUT="90s```

- Lưu ý: GEMINI_MODEL không được có tiền tố models/.
Kiểm tra biến môi trường:
```test -n "$GEMINI_API_KEY" && echo "Gemini API key OK"```
```test -n "$JWT_SECRET" && echo "JWT secret OK"```
```echo "Gemini model: $GEMINI_MODEL"```
- Khởi động backend:
```./mvnw spring-boot:run```
Chờ xuất hiện:
Tomcat started on port 8080
Started BackendApplication

# 2. Terminal chạy mobile
Mở terminal khác:
cd "thư mục mobile"
```npx expo start --phiên ban su dung```
Nếu Expo đang cache bản cũ:
npx expo start --ios --clear

# 3. Kiểm tra Gemini API key — tùy chọn
Chạy khi backend đang tắt:
cd /Users/nguyenthanhan/Resume_Analyser/backend
```./mvnw \```
 ``` -Dtest=GeminiSmokeClientTest#configuredFreeTierKeyCanReachGemini \```
 ``` test```

# 4. Kiểm tra phân tích PDF thật — tùy chọn
export RUN_GEMINI_CV_LIVE_TEST=true

export GEMINI_TEST_PDF_PATH="/Users/nguyenthanhan/Resume_Analyser/backend/uploads/resumes/89f5e118-7774-4884-aa85-0ed8168f38dd.pdf"

```./mvnw \-Dtest=GeminiCvExtractionClientTest#extractsARealPdfWithGemini \test```
# 5. Nếu cổng 8080 đang bị chiếm
lsof -nP -iTCP:8080 -sTCP:LISTEN
Spring Boot không tự động đọc file .env. Trước khi chạy backend, cần nạp nó vào terminal:
cd /Users/nguyenthanhan/Resume_Analyser

```set -a source .env set +a```

cd backend
./mvnw spring-boot:run
