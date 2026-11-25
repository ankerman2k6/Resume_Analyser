# Resume Analyser

Ứng dụng phân tích CV với Spring Boot (Java 21), MongoDB và các client web/mobile.

## Giám sát backend bằng Prometheus trên Docker local

Cấu hình monitoring chạy độc lập với Compose ứng dụng:

- `monitoring/prometheus/prometheus.yml`: scrape mỗi 15 giây, evaluation mỗi 15 giây, job `resume-backend`, endpoint `http://backend:8080/actuator/prometheus`.
- `docker-compose.monitoring.yml`: image official `prom/prometheus:v3.13.5`, cổng `127.0.0.1:9090:9090`, cấu hình mount read-only, named volume `prometheus-data`, retention 15 ngày và restart `unless-stopped`.
- Prometheus và backend dùng chung external Docker network `resume-network` đã khai báo trong `docker-compose.yml`. Trong container dùng service DNS `backend` và port nội bộ `8080`; port `8081` dành cho truy cập từ máy host.

Phiên bản được cố định theo [Prometheus LTS release](https://prometheus.io/download/). Dữ liệu metrics được giữ qua các lần tạo lại container nhờ volume; retention theo thời gian không phải giới hạn dung lượng đĩa.

### Khởi chạy bằng PowerShell

Điều kiện: Docker Desktop đang chạy, stack ứng dụng local đã chạy và backend đã trả metrics tại `http://localhost:8081/actuator/prometheus`. Chạy từ thư mục gốc repository:

Before running monitoring Compose commands, set `GRAFANA_ADMIN_PASSWORD` in the root `.env` as described below. For a fresh environment only, create the external metrics volume with `docker volume create prometheus-data`; keep the existing volume.

```powershell
Set-Location D:\mobileWebCuoiKy\Resume_Analyser

# Kiểm tra network hiện có; không cần tạo lại network của stack đang chạy.
docker network inspect resume-network

# Chỉ khởi chạy Prometheus, không build hoặc khởi động lại stack ứng dụng.
docker compose -p resume-monitoring -f docker-compose.monitoring.yml up -d prometheus

# Xem trạng thái và log.
docker compose -p resume-monitoring -f docker-compose.monitoring.yml ps
docker compose -p resume-monitoring -f docker-compose.monitoring.yml logs --tail 100 prometheus
```

Luôn dùng cùng tên project `-p resume-monitoring` và file monitoring khi quản lý Prometheus. File này dùng độc lập, không cần ghép với `docker-compose.yml` hoặc `compose.vps.yml`.

Nếu network chưa tồn tại, chạy `docker network create resume-network` trước khi tự khởi chạy stack ứng dụng local bằng quy trình hiện tại. Backend phải nằm trong network này để DNS `backend` hoạt động.

### Kiểm tra target và metrics

1. Mở [Targets](http://localhost:9090/targets), đợi khoảng 15–30 giây. Job `resume-backend` phải có trạng thái **UP**, scrape URL `http://backend:8080/actuator/prometheus`.
2. Mở [Prometheus](http://localhost:9090), nhập `up{job="resume-backend"}` và chọn Execute. Giá trị `1` nghĩa là scrape thành công; `0` nghĩa là scrape thất bại.
3. Gọi một số API bình thường qua frontend hoặc backend, chờ thêm vài lần scrape trước khi xem truy vấn `rate(...[5m])`. Không tạo API hoặc thay đổi quyền truy cập để phát sinh dữ liệu.

Nếu target DOWN, xem Last scrape error và log Prometheus. Kiểm tra backend đang chạy, cùng network `resume-network`, và endpoint metrics không yêu cầu đăng nhập. `localhost:8081` là địa chỉ trên host, không phải target trong Docker.

### Truy vấn PromQL cơ bản

Các truy vấn lọc theo job để chỉ xem backend. HTTP metrics require completed requests; latency and ratios may be empty or NaN without traffic. GC series depend on the collector and recorded events. Missing metrics are not replaced with zero; check up before interpreting results.

| Nhóm metrics | Truy vấn | Ý nghĩa / đơn vị |
| --- | --- | --- |
| JVM memory | `sum(jvm_memory_used_bytes{job="resume-backend",area="heap"})` | Heap đang dùng, byte |
| CPU process | `100 * process_cpu_usage{job="resume-backend"}` | CPU của JVM, % theo số CPU khả dụng |
| CPU system | `100 * system_cpu_usage{job="resume-backend"}` | CPU hệ thống JVM quan sát được, % |
| HTTP request rate | `sum(rate(http_server_requests_seconds_count{job="resume-backend",uri!~"/actuator/.*"}[5m]))` | Request/giây |
| HTTP response time trung bình | `sum(rate(http_server_requests_seconds_sum{job="resume-backend",uri!~"/actuator/.*"}[5m])) / sum(rate(http_server_requests_seconds_count{job="resume-backend",uri!~"/actuator/.*"}[5m]))` | Giây/request |
| HTTP response time p95 | `histogram_quantile(0.95, sum by (le) (rate(http_server_requests_seconds_bucket{job="resume-backend",uri!~"/actuator/.*"}[5m])))` | 95% request có thời gian không vượt quá giá trị này, giây |
| HTTP 5xx rate | `sum(rate(http_server_requests_seconds_count{job="resume-backend",status=~"5..",uri!~"/actuator/.*"}[5m]))` | Lỗi server/giây; đổi thành `4..` để xem lỗi client |
| HTTP error % (4xx + 5xx) | `100 * (sum(rate(http_server_requests_seconds_count{job="resume-backend",status=~"[45]..",uri!~"/actuator/.*"}[5m]))) / sum(rate(http_server_requests_seconds_count{job="resume-backend",uri!~"/actuator/.*"}[5m]))` | Tỷ lệ request lỗi, % |
| JVM threads | `jvm_threads_live_threads{job="resume-backend"}` | Số thread đang hoạt động |
| GC pause rate | `sum(rate(jvm_gc_pause_seconds_count{job="resume-backend"}[5m]))` | Số lần GC pause/giây |
| GC pause time | `sum(rate(jvm_gc_pause_seconds_sum{job="resume-backend"}[5m]))` | Tổng giây pause/giây |
| MongoDB pool size | `mongodb_driver_pool_size{job="resume-backend"}` | Tổng connection idle và đang dùng, theo pool |
| MongoDB pool checked out | `mongodb_driver_pool_checkedout{job="resume-backend"}` | Connection đang dùng, theo pool |
| MongoDB pool wait queue | `mongodb_driver_pool_waitqueuesize{job="resume-backend"}` | Số request chờ connection, theo pool |
| Application uptime | `process_uptime_seconds{job="resume-backend"}` | Thời gian JVM chạy từ lúc khởi động, giây |

HTTP metrics chỉ xuất hiện sau khi có request hoàn tất; histogram đã bật trong cấu hình backend hiện tại. GC metrics tùy collector và sự kiện GC đã xảy ra. Truy vấn trung bình/p95/tỷ lệ có thể trống hoặc `NaN` khi chưa có lưu lượng hoặc chưa đủ mẫu. Giá trị mặc định `0` trong truy vấn lỗi cần được đọc cùng `up`; nó không xác nhận backend đang khỏe.

[Spring Boot tự cấu hình MongoDB connection pool metrics](https://docs.spring.io/spring-boot/reference/actuator/metrics.html) cho `MongoClient` mặc định. Project hiện dùng starter MongoDB và không khai báo custom MongoClient. Các metrics này quan sát pool phía backend, không phải toàn bộ trạng thái MongoDB server. Nếu thiếu series, kiểm tra trực tiếp endpoint metrics và việc backend kết nối MongoDB; không thay đổi database hay security để xử lý monitoring. Có thể tìm các series đã scrape bằng:

```promql
{job="resume-backend",__name__=~"mongodb_driver_pool_.*"}
```

### Dừng hoặc nạp lại cấu hình

```powershell
# Dừng monitoring, giữ nguyên metrics và stack ứng dụng.
docker compose -p resume-monitoring -f docker-compose.monitoring.yml stop prometheus

# Sau khi sửa prometheus.yml, khởi động lại để đọc cấu hình mới.
docker compose -p resume-monitoring -f docker-compose.monitoring.yml restart prometheus
```

Monitoring commands preserve MongoDB volumes. Grafana provisioning and manual VPS instructions are provided below; CI/CD remains unchanged.

Cấu hình được chuẩn bị trong repository; chưa chạy Docker, build image hoặc kiểm thử runtime. Các bước xác minh phía trên do người vận hành tự chạy.

## Grafana: dashboard được provision tự động

Grafana dùng official image [`grafana/grafana:13.2.1`](https://grafana.com/grafana/download/13.2.1?edition=oss&platform=docker), chỉ bind `127.0.0.1:3001`, tắt anonymous access và đăng ký tài khoản. Volume `grafana-data` lưu tài khoản, thiết lập và cơ sở dữ liệu Grafana; Compose tạo volume này nếu chưa có. Volume external `prometheus-data` và cấu hình service Prometheus giữ nguyên.

Các file cấu hình:

- `monitoring/grafana/provisioning/datasources/prometheus.yml`: datasource mặc định **Prometheus**, UID cố định `resume-prometheus`, URL nội bộ `http://prometheus:9090`, không cần cấu hình qua UI.
- `monitoring/grafana/provisioning/dashboards/backend.yml`: nạp dashboard vào folder **Resume Analyser**, kiểm tra thay đổi file mỗi 30 giây.
- `monitoring/grafana/dashboards/resume-backend.json`: dashboard **Resume Analyser - Backend Monitoring**, UID `resume-backend-monitoring`, 14 panel trong bốn nhóm Application Overview, JVM Resources, HTTP Performance và MongoDB Connections. Dashboard refresh mỗi 15 giây, khoảng mặc định 30 phút.

Provisioning và dashboard được mount read-only. Muốn thay đổi dashboard, sửa JSON trong repository; chỉnh sửa UI không được lưu đè provisioning. Giao diện mặc định dark; tài khoản đã có tùy chọn theme riêng có thể ghi đè theme mặc định.

### Cấu hình mật khẩu và khởi chạy Grafana local

Thêm dòng sau vào `.env` gốc hiện có, điền mật khẩu mạnh, riêng biệt sau dấu `=`. Không chép đè `.env` vì file có JWT và các thiết lập khác. `.env` đã được Git bỏ qua; không commit mật khẩu.

```ini
GRAFANA_ADMIN_PASSWORD=
```

Nếu mật khẩu có `$` hoặc `#`, dùng giá trị được bao bằng dấu nháy đơn trong `.env` để tránh nội suy. Biến môi trường PowerShell cùng tên nếu đang đặt sẽ được ưu tiên hơn `.env`.

Chạy thủ công trong PowerShell, với Prometheus đang chạy:

```powershell
Set-Location D:\mobileWebCuoiKy\Resume_Analyser

# Chỉ khởi chạy Grafana; giữ nguyên Prometheus đang chạy.
docker compose -f docker-compose.monitoring.yml up -d --no-deps grafana
docker compose -f docker-compose.monitoring.yml logs --tail 100 grafana
```

Mở [Grafana](http://localhost:3001), đăng nhập bằng user `admin` và mật khẩu đã đặt. Dashboard có sẵn tại [Resume Analyser - Backend Monitoring](http://localhost:3001/d/resume-backend-monitoring). Không cần tạo datasource hoặc import dashboard thủ công.

Mật khẩu môi trường chỉ khởi tạo admin khi volume Grafana còn mới. Đổi biến này không tự đổi mật khẩu tài khoản đã lưu trong volume; dùng chức năng đổi mật khẩu trong Grafana. Vì Compose xác thực biến bắt buộc, cần giữ `GRAFANA_ADMIN_PASSWORD` khi chạy các lệnh Compose monitoring, kể cả khi chỉ quản lý Prometheus.

### Metrics và cách đọc dashboard

Đã đọc tên series trực tiếp từ endpoint backend local khi chuẩn bị cấu hình, bao gồm:

- CPU/uptime: `process_cpu_usage`, `process_uptime_seconds`.
- JVM: `jvm_memory_used_bytes`, `jvm_memory_committed_bytes`, `jvm_threads_live_threads`, `jvm_gc_pause_seconds_sum` và `_count`.
- HTTP: `http_server_requests_seconds_count`, `_sum`, `_bucket`.
- MongoDB: `mongodb_driver_pool_size`, `_checkedout`, `_waitqueuesize`, `_checkoutfailed_total`.

Tên checkout failures cũng khớp [MongoMetricsConnectionPoolListener của Micrometer](https://github.com/micrometer-metrics/micrometer/blob/main/micrometer-core/src/main/java/io/micrometer/core/instrument/binder/mongodb/MongoMetricsConnectionPoolListener.java). Panel sử dụng `rate(mongodb_driver_pool_checkoutfailed_total{job="resume-backend"}[$__rate_interval])`, đơn vị failures/giây.

Mọi query lọc job `resume-backend`. HTTP loại `uri` khớp `/actuator($|/.*)`. CPU nhân 100 thành percent; bộ nhớ dùng bytes; HTTP latency và p95 nhân 1000 thành milliseconds; lưu lượng và lỗi HTTP dùng requests/second. GC thể hiện milliseconds pause/giây; MongoDB pool thể hiện số connection và số request chờ theo pool.

Không dùng dữ liệu giả, `or vector(0)`, nối qua khoảng trống hoặc mapping thiếu dữ liệu thành zero. Không có series lỗi 4xx/5xx thì panel báo **No data**, khác với series thật có rate bằng 0. Chưa có traffic hoặc chưa đủ mẫu thì latency có thể không xác định. Status dùng query tức thời `up`: `1` là UP, `0` là DOWN; mất target hoàn toàn là No data. Heap/non-heap hiển thị used và committed, không suy đoán max cho pool không có giới hạn xác định.

Đọc tên series là thao tác quan sát endpoint; chưa chạy Docker, kiểm thử dashboard, hoặc xác nhận provisioning runtime. Người vận hành tự kiểm tra datasource, dashboard và trạng thái target sau khi khởi chạy.

### Triển khai monitoring trên VPS (thao tác thủ công)

Hướng dẫn này không thay đổi `compose.vps.yml` và không triển khai tự động. Chuyển `docker-compose.monitoring.yml` cùng toàn bộ thư mục `monitoring/` lên cùng một thư mục làm việc trên VPS; tạo `.env` riêng với `GRAFANA_ADMIN_PASSWORD` và giới hạn quyền đọc file, ví dụ `chmod 600 .env`. Không đưa secrets local lên Git.

Compose VPS hiện dùng network mặc định của project ứng dụng. Trước khi chạy monitoring, phải cho backend tham gia external network `resume-network`; nếu không, target `backend:8080` không phân giải được. Các lệnh Bash sau chạy thủ công trên VPS, từ thư mục có các file Compose và với đúng tên project/biến môi trường của deployment hiện tại:

```bash
# Chỉ tạo nếu network hoặc volume chưa tồn tại.
docker network inspect resume-network >/dev/null 2>&1 || docker network create resume-network
docker volume inspect prometheus-data >/dev/null 2>&1 || docker volume create prometheus-data

# Lấy container backend từ đúng Compose project đang chạy.
backend_container_id=$(docker compose -f compose.vps.yml ps -q backend)
# Chỉ chạy khi ID không rỗng và backend chưa nằm trong resume-network.
docker network connect --alias backend resume-network "$backend_container_id"

docker compose -f docker-compose.monitoring.yml up -d
```

Nếu deployment dùng `-p` hoặc `--env-file`, bổ sung đúng các tùy chọn đó vào lệnh lấy backend ID. Không chạy lệnh connect nếu ID rỗng. Việc nối network thủ công phải làm lại khi backend container được tạo mới; để vận hành lâu dài cần quản lý kết nối network này trong cấu hình deployment riêng. Không cần sửa URI database hoặc volume MongoDB.

Giữ mapping loopback của cả hai dịch vụ. Từ PowerShell trên máy cá nhân, mở SSH tunnel bằng tài khoản và địa chỉ VPS của bạn:

```powershell
ssh -N -L 3001:127.0.0.1:3001 -L 9090:127.0.0.1:9090 your-user@your-vps
```

Sau đó truy cập `http://localhost:3001` và `http://localhost:9090` trên máy cá nhân. Dừng monitoring local đang dùng cùng các cổng trước khi tạo tunnel hoặc chọn cổng local khác. Không mở firewall public cho 3001/9090. Không chạy `down -v` hoặc xóa volume; giữ `prometheus-data` và `grafana-data` để bảo toàn dữ liệu.
