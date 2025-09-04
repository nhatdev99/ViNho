# Firebase Setup Guide

## Cài đặt Firebase cho ứng dụng ViNho

### 1. Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới với tên "ViNho" hoặc tên bạn muốn
3. Bật Authentication và Firestore Database

### 2. Cấu hình Authentication

1. Trong Firebase Console, vào **Authentication** > **Sign-in method**
2. Bật **Email/Password** provider
3. (Tùy chọn) Bật các provider khác như Google, Facebook nếu cần

### 3. Cấu hình Firestore Database

1. Vào **Firestore Database** > **Create database**
2. Chọn **Start in test mode** (để phát triển)
3. Chọn location gần nhất (asia-southeast1 cho Việt Nam)

### 4. Lấy Firebase Config

1. Vào **Project Settings** (biểu tượng bánh răng)
2. Scroll xuống **Your apps** section
3. Click **Add app** > **Web app** (biểu tượng `</>`)
4. Đặt tên app và copy config object

### 5. Cập nhật Firebase Config

Mở file `src/config/firebase.ts` và thay thế config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

### 6. Cấu hình Firestore Rules

Vào **Firestore Database** > **Rules** và cập nhật:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Expenses collection
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Settings collection
    match /settings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. Cài đặt Dependencies

Các dependencies đã được cài đặt:
- `firebase`
- `@react-native-firebase/app`
- `@react-native-firebase/auth`
- `@react-native-firebase/firestore`

### 8. Tính năng đã được thêm

✅ **Authentication System**
- Đăng nhập/Đăng ký với email/password
- Quên mật khẩu
- Đăng xuất
- Persistent login với AsyncStorage

✅ **Data Synchronization**
- Đồng bộ expenses với Firestore
- Đồng bộ settings với Firestore
- Real-time updates
- Offline support

✅ **UI Components**
- LoginScreen với theme support
- RegisterScreen với validation
- AuthWrapper component
- Logout button trong Settings

### 9. Cách sử dụng

1. **Đăng ký tài khoản mới** hoặc **đăng nhập**
2. Dữ liệu sẽ được tự động đồng bộ với Firebase
3. Có thể đăng xuất từ Settings screen
4. Dữ liệu được lưu trữ an toàn trên cloud

### 10. Lưu ý bảo mật

- Không commit Firebase config với API keys thật
- Sử dụng environment variables cho production
- Cấu hình Firestore rules phù hợp
- Bật App Check cho production

### 11. Troubleshooting

**Lỗi "Firebase not initialized":**
- Kiểm tra Firebase config
- Đảm bảo project ID đúng

**Lỗi "Permission denied":**
- Kiểm tra Firestore rules
- Đảm bảo user đã đăng nhập

**Lỗi "Network request failed":**
- Kiểm tra kết nối internet
- Kiểm tra Firebase project status
