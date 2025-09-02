Write-Host "Chuẩn bị cài đặt dự án..." -ForegroundColor Cyan

# Xóa thư mục node_modules và file yarn.lock cũ
Write-Host "Đang xóa thư mục node_modules cũ..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
}
if (Test-Path "yarn.lock") {
    Remove-Item yarn.lock
}

# Cài đặt lại các dependencies
Write-Host "Đang cài đặt dependencies..." -ForegroundColor Cyan
yarn install

# Cài đặt các dependencies bổ sung
Write-Host "Đang cài đặt các dependencies bổ sung..." -ForegroundColor Cyan
yarn add -D @types/react @types/react-native
npx expo install react-native-screens react-native-safe-area-context

# Khởi động dự án
Write-Host "Đang khởi động dự án..." -ForegroundColor Green
Write-Host "Vui lòng đợi trong giây lát..." -ForegroundColor Yellow
npx expo start --clear
