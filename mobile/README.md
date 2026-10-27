# Mobile

Ứng dụng Expo React Native cho Resume Analyser.

Project đã được bootstrap bằng Expo và TypeScript. Giữ phần mã ứng dụng trong `src/`; các file ở root như `app.json`, `package.json`, `index.ts` và `App.tsx` là cấu hình/entry point của Expo.

## Cấu trúc

```text
mobile/
├── android/                 # Sinh khi chạy expo prebuild (nếu cần native project)
├── ios/                     # Sinh khi chạy expo prebuild (nếu cần native project)
├── src/
│   ├── core/                # App root, providers và app-level setup
│   ├── assets/              # Font, icon, image dùng chung
│   ├── components/          # UI component dùng chung, không gắn feature
│   ├── config/              # Environment và cấu hình runtime
│   ├── constants/           # Giá trị hằng dùng chung
│   ├── features/            # Mã theo nghiệp vụ
│   │   ├── applications/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── interviews/
│   │   ├── jobs/
│   │   ├── profile/
│   │   └── resumes/
│   ├── hooks/               # Hook dùng chung
│   ├── navigation/          # Stack/tab navigation và route params
│   ├── services/            # HTTP client, storage và integrations
│   ├── store/               # Global state
│   ├── theme/               # Token và theme dùng chung
│   ├── types/               # Type dùng chung giữa nhiều feature
│   └── utils/               # Hàm tiện ích thuần
├── __tests__/               # Test tích hợp và test cấp app
├── .env.example
└── package.json
```

## Quy ước tích hợp backend

- Base URL giữ ở `src/config/`, không hard-code trong screen.
- HTTP client và interceptor JWT đặt ở `src/services/api/`.
- Token/session storage đặt ở `src/services/storage/`.
- Mỗi feature tự chứa API, hooks, screens và types riêng.
- Các endpoint candidate dùng prefix `/api`, theo contract hiện có trong `docs/candidate-profile-api-contract.md`.
- Không để logic gọi API trực tiếp trong component UI.

## Lệnh phát triển

```bash
npm install
npm start
```

Không commit `node_modules/`, `.expo/`, file `.env*.local` hoặc native folders được sinh tự động.

Cách sử dụng code, chạy code
npm install (tải npm)
npx expo start -> Sau đó sẽ hiển thị ra mã QR ở console output -> Tải ứng dụng Expo Go rồi quét QR 

