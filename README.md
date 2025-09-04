# ViNho - Ứng Dụng Quản Lý Chi Tiêu Cá Nhân

> 🍷 **ViNho** là ứng dụng quản lý chi tiêu thông minh được xây dựng bằng React Native, giúp bạn theo dõi và kiểm soát tài chính cá nhân một cách hiệu quả.

## 📱 Tính Năng Chính

### 🏠 **Trang Chủ (HomeScreen)**
- **Tổng quan chi tiêu hôm nay**: Hiển thị số tiền đã chi trong ngày
- **Tiến độ ngân sách tháng**: Theo dõi chi tiêu so với hạn mức đã đặt
- **Cảnh báo thông minh**: Thông báo khi gần vượt ngân sách (>80%) hoặc đã vượt (>100%)
- **Danh sách giao dịch hôm nay**: Xem chi tiết từng khoản chi tiêu
- **Preload ảnh tối ưu**: Hiển thị giao diện mượt mà với hình ảnh được tối ưu

### ➕ **Thêm Giao Dịch (AddExpenseScreen)**
- **Giao diện trò chuyện thân thiện**: Thêm chi tiêu như đang chat với bot
- **Hỗ trợ đa loại giao dịch**: Chi tiêu và thu nhập
- **Danh mục có sẵn**: 9 danh mục phổ biến (Ăn uống, Di chuyển, Nhà ở, v.v.)
- **Cảnh báo ngân sách realtime**: Thông báo ngay khi nhập số tiền có nguy cơ vượt ngân sách
- **Keyboard-friendly**: Tự động ẩn bàn phím khi chạm ra ngoài

### 📊 **Thống Kê (StatsScreen)**
- **Lọc theo thời gian**: Xem chi tiêu theo ngày/tuần/tháng
- **Bộ lọc nâng cao**: Tìm kiếm theo danh mục, khoảng số tiền, từ khóa
- **Nhóm dữ liệu thông minh**: Theo danh mục (ngày) hoặc theo ngày (tuần/tháng)
- **Date picker tích hợp**: Chọn ngày dễ dàng với DateTimePicker
- **Xóa giao dịch**: Quản lý dữ liệu trực tiếp từ danh sách

### 🛠️ **Công Cụ (ToolsScreen)**
#### **1. Ngân Sách Hàng Tháng**
- Tính toán phân bổ thu nhập theo tỷ lệ tiết kiệm
- Đề xuất chi tiêu cho từng danh mục
- Hiển thị số tiền tiết kiệm và chi tiêu

#### **2. Dự Đoán Số Dư Cuối Tháng**
- Phân tích chi tiêu trung bình 30 ngày gần nhất
- Tự động tính ngày còn lại trong tháng
- Cảnh báo nguy cơ thâm hụt

#### **3. Tính Lãi Suất Tiết Kiệm (Lãi Kép)**
- Hỗ trợ góp định kỳ hàng tháng
- Tính toán với nhiều chu kỳ lãi khác nhau
- Hiển thị giá trị tương lai của khoản tiết kiệm

#### **4. Tính Khoản Vay**
- Tính số tiền trả hàng tháng
- Hỗ trợ các loại lãi suất khác nhau
- Phân tích khả năng chi trả

#### **5. Phân Tích Chi Tiêu**
- **Biểu đồ tròn**: Phân bổ chi tiêu theo danh mục với tỷ lệ %
- **Biểu đồ đường**: Xu hướng chi tiêu 7 ngày gần nhất
- **Dữ liệu realtime**: Cập nhật từ dữ liệu thực tế

#### **6. Giao Dịch Định Kỳ**
- **Chu kỳ linh hoạt**: Hàng ngày, hàng tuần, hàng tháng
- **Date picker**: Chọn ngày bắt đầu dễ dàng
- **Preview số tiền**: Xem trước số tiền sẽ được tạo
- **Quản lý danh sách**: Xem và xóa giao dịch định kỳ

#### **7. Export/Import Dữ Liệu**
- **Xuất CSV**: Lưu toàn bộ dữ liệu ra file CSV
- **Nhập CSV**: Import dữ liệu từ file CSV
- **Tương thích**: Định dạng CSV chuẩn, dễ chỉnh sửa

### 💰 **Quản Lý Ngân Sách (BudgetScreen)**
- **Modal thân thiện**: Giao diện đơn giản, dễ sử dụng
- **Hạn mức tháng**: Đặt ngân sách tổng cho từng tháng
- **Preview số tiền**: Hiển thị định dạng tiền tệ rõ ràng
- **Auto-sync**: Tự động đồng bộ với HomeScreen sau khi lưu

### ⚙️ **Cài Đặt (SettingsScreen)**
- **Quản lý danh mục**: Tùy chỉnh danh mục chi tiêu
- **Chế độ giao diện**: Light/Dark/System
- **Cài đặt thông báo**: Tùy chỉnh nhắc nhở hàng ngày/tuần/tháng
- **Đơn vị tiền tệ**: Hỗ trợ nhiều loại tiền tệ

## 🔥 **Tính Năng Nâng Cao**

### 🎨 **Giao Diện & Trải Nghiệm**
- **Theme System**: Hỗ trợ chế độ sáng/tối/theo hệ thống
- **Responsive Design**: Tối ưu cho mọi kích thước màn hình
- **Smooth Navigation**: Điều hướng mượt mà với React Navigation
- **Keyboard Handling**: Tự động ẩn bàn phím thông minh
- **Loading States**: Hiển thị trạng thái tải dữ liệu

### 💾 **Quản Lý Dữ Liệu**
- **AsyncStorage**: Lưu trữ dữ liệu cục bộ an toàn
- **Redux Toolkit**: Quản lý state toàn cục hiệu quả
- **Firebase Integration**: Đồng bộ dữ liệu đám mây (tùy chọn)
- **Data Validation**: Kiểm tra tính hợp lệ của dữ liệu
- **Error Handling**: Xử lý lỗi graceful

### 🔒 **Bảo Mật & Xác Thực**
- **Firebase Auth**: Đăng nhập an toàn
- **Persistent Login**: Duy trì trạng thái đăng nhập
- **Data Encryption**: Mã hóa dữ liệu nhạy cảm

## 🚀 **Cài Đặt & Chạy Ứng Dụng**

### **Yêu Cầu Hệ Thống**
- Node.js >= 16.0.0
- npm hoặc yarn
- Expo CLI
- Android Studio (cho Android) hoặc Xcode (cho iOS)

### **Clone Repository**
```bash
git clone https://github.com/nhatdev99/ViNho.git
cd ViNho
```

### **Cài Đặt Dependencies**
```bash
npm install
# hoặc
yarn install
```

### **Chạy Ứng Dụng**
```bash
# Chạy trên Expo
npm start

# Chạy trên Android
npm run android

# Chạy trên iOS
npm run ios

# Chạy trên Web
npm run web
```

## 📦 **Cấu Trúc Dự Án**

```
src/
├── components/           # Các component tái sử dụng
│   ├── AuthWrapper.tsx   # Wrapper xác thực
│   └── Message.tsx       # Component tin nhắn chat
├── config/              # Cấu hình ứng dụng
│   └── firebase.ts      # Cấu hình Firebase
├── contexts/            # React Contexts
│   └── AuthContext.tsx  # Context xác thực
├── navigation/          # Điều hướng
│   └── AppNavigator.tsx # Navigation chính
├── screens/             # Các màn hình
│   ├── AddExpenseScreen.tsx
│   ├── BudgetScreen.tsx
│   ├── HomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── RecurringScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── StatsScreen.tsx
│   └── ToolsScreen.tsx
├── services/            # Dịch vụ
│   └── firestoreService.ts
├── store/               # Redux store
│   ├── budgetsSlice.ts
│   ├── expensesSlice.ts
│   ├── goalsSlice.ts
│   ├── recurrencesSlice.ts
│   ├── settingsSlice.ts
│   └── index.ts
├── types/               # TypeScript types
│   └── index.ts
├── utils/               # Utilities
│   ├── csv.ts          # Xử lý CSV
│   ├── dateUtils.ts    # Xử lý ngày tháng
│   ├── format.ts       # Format dữ liệu
│   ├── storage.ts      # Quản lý lưu trữ
│   └── tools.ts        # Công cụ tính toán
└── theme/              # Hệ thống theme
```

## 🛠️ **Tech Stack**

### **Frontend Framework**
- **React Native** - Framework đa nền tảng
- **Expo** - Toolkit phát triển React Native
- **TypeScript** - Type safety

### **State Management**
- **Redux Toolkit** - Quản lý state
- **React Redux** - React bindings cho Redux

### **Navigation**
- **React Navigation v6** - Navigation library
- **Bottom Tabs** - Tab navigation
- **Stack Navigator** - Stack navigation

### **UI Components**
- **React Native Elements** - UI components
- **Expo Vector Icons** - Icon library
- **React Native Chart Kit** - Biểu đồ

### **Data & Storage**
- **AsyncStorage** - Local storage
- **Firebase Firestore** - Cloud database
- **Firebase Auth** - Authentication

### **Utilities**
- **Date-fns** - Date utilities
- **React Hook Form** - Form handling
- **React Native DateTimePicker** - Date picker

## 📈 **Roadmap**

### **Phase 1: Core Features** ✅
- [x] Quản lý chi tiêu cơ bản
- [x] Thống kê và báo cáo
- [x] Giao diện responsive

### **Phase 2: Advanced Features** ✅
- [x] Ngân sách và cảnh báo
- [x] Export/Import CSV
- [x] Giao dịch định kỳ

### **Phase 3: Smart Features** 🚧
- [ ] Mục tiêu tiết kiệm
- [ ] Auto-tạo giao dịch từ định kỳ
- [ ] Đa tiền tệ

### **Phase 4: AI & Automation** 📋
- [ ] OCR hóa đơn
- [ ] Gợi ý danh mục thông minh
- [ ] Phân tích xu hướng AI

### **Phase 5: Social & Sharing** 📋
- [ ] Chia sẻ báo cáo
- [ ] So sánh với bạn bè
- [ ] Thử thách tiết kiệm

## 🤝 **Đóng Góp**

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng đọc [CONTRIBUTING.md](CONTRIBUTING.md) để biết cách đóng góp.

### **Các Bước Đóng Góp**
1. Fork repository này
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 **License**

Dự án này được phát hành dưới giấy phép MIT. Xem [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 **Liên Hệ**

- **Email**: nhatdev99@gmail.com
- **GitHub**: [@nhatdev99](https://github.com/nhatdev99)
- **LinkedIn**: [Nhật Dev](https://linkedin.com/in/nhatdev99)

## 🙏 **Cảm Ơn**

- **React Native Team** - Framework tuyệt vời
- **Expo Team** - Công cụ phát triển mạnh mẽ
- **Firebase Team** - Backend-as-a-Service hoàn hảo
- **Community Contributors** - Các thư viện mã nguồn mở

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/nhatdev99">Nhật Dev</a></p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>