#!/bin/bash
echo "=========================================================="
echo ">>> Đang tự động nạp cấu trúc và dữ liệu cho database cv_screening..."
echo "=========================================================="

# Phục hồi dữ liệu từ thư mục dump
mongorestore --db cv_screening /docker-entrypoint-initdb.d/cv_screening

echo "=========================================================="
echo ">>> Đã khởi tạo thành công database cv_screening!"
echo "=========================================================="
