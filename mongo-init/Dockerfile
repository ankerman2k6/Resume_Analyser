FROM mongo:7

# Copy cấu trúc và dữ liệu backup vào thư mục auto-init của MongoDB
COPY cv_screening /docker-entrypoint-initdb.d/cv_screening
COPY init-db.sh /docker-entrypoint-initdb.d/init-db.sh

RUN chmod +x /docker-entrypoint-initdb.d/init-db.sh
