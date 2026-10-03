
## Model
- .mdm: file quan trọng nhất cho Data Modeling trong Compass. Vào Data Modeling → Import Diagram rồi chọn file .mdm, sơ đồ sẽ mở lại để xem hoặc chỉnh sửa.
- .json: chứa dữ liệu model thô như collections, jsonSchema, relationships (chủ yếu để đọc bằng code, lưu Git).
---
## Còn lại
- trong folder `model` chứa tổng quan database sẽ giúp xem trực quan hơi
- `03-seed-data.js` tạo lại data khi cần
- import database bằng lệnh dưới. Yêu cầu phải có mongodump
```
mongodump `
  --uri="mongodb://localhost:27017" `
  --db=cv_screening `
  --archive="cv_screening.archive" `
  --gzip
```