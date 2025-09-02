@echo off
echo Đang chuẩn bị cài đặt dự án...
echo.

REM Xóa thư mục node_modules và file yarn.lock cũ
echo Đang xóa thư mục node_modules cũ...
if exist node_modules rmdir /s /q node_modules
if exist yarn.lock del /f yarn.lock

REM Cài đặt lại các dependencies
echo.
echo Đang cài đặt dependencies...
call yarn install

REM Cài đặt các dependencies bổ sung
echo.
echo Đang cài đặt các dependencies bổ sung...
call yarn add -D @types/react @types/react-native
call npx expo install react-native-screens react-native-safe-area-context

REM Khởi động dự án
echo.
echo Đang khởi động dự án...
echo Vui lòng đợi trong giây lát...
call npx expo start --clear
