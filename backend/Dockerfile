# =============================================
# STAGE 1: Build - Biên dịch mã nguồn Java
# =============================================
# Dùng Maven + JDK 21 để build project 
FROM maven:3.9-eclipse-temurin-21 AS build

# Đặt thư mục làm việc bên trong container
WORKDIR /app

# Copy file pom.xml trước để Docker cache lại các dependency
# (Nếu pom.xml không đổi, Docker sẽ bỏ qua bước tải dependency → build nhanh hơn)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy toàn bộ mã nguồn vào container
COPY src ./src

# Build project, bỏ qua test để build nhanh hơn
# Kết quả là file .jar trong thư mục target/
RUN mvn package -DskipTests -B

# =============================================
# STAGE 2: Run - Chạy ứng dụng
# =============================================
# Dùng JRE 21 nhẹ hơn (không cần compiler nữa)
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy file .jar từ stage build sang stage run
COPY --from=build /app/target/*.jar app.jar

# Mở cổng API của backend
EXPOSE 8081

# Lệnh khởi chạy ứng dụng, câu lệnh khi mà load xong môi trường thì sẽ chạy câu lệnh này
ENTRYPOINT ["java", "-jar", "app.jar"] 
# Viết theo java version, với version tương ứng
