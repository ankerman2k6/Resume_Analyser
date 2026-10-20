FROM mongo:7

# Copy cấu trúc và dữ liệu backup vào thư mục auto-init của MongoDB
COPY cv_screening /docker-entrypoint-initdb.d/cv_screening
COPY init-db.sh /docker-entrypoint-initdb.d/init-db.sh
COPY 02-candidate-profile-indexes.js /docker-entrypoint-initdb.d/02-candidate-profile-indexes.js

RUN chmod +x /docker-entrypoint-initdb.d/init-db.sh
