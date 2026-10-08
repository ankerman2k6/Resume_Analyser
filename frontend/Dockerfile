# =============================================
# STAGE 1: Build - Biên dịch React app
# =============================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy file package.json và package-lock.json trước
# để Docker cache lại node_modules (tương tự pom.xml ở backend)
COPY package.json package-lock.json ./
RUN npm ci

# Copy toàn bộ mã nguồn frontend
COPY . .

# Build production (kết quả nằm trong thư mục dist/)
RUN npm run build

# =============================================
# STAGE 2: Serve - Chạy Nginx để phục vụ file tĩnh
# =============================================
FROM nginx:alpine

# Copy file build (dist/) vào thư mục mặc định của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy cấu hình Nginx tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
