const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Đang chuẩn bị cài đặt dự án...\n');

// Hàm chạy lệnh
const runCommand = (command, description) => {
  console.log(`🔧 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Lỗi khi thực hiện lệnh: ${command}`);
    return false;
  }
};

// Xóa thư mục node_modules và file yarn.lock
console.log('🧹 Đang dọn dẹp...');
if (fs.existsSync('node_modules')) {
  fs.rmSync('node_modules', { recursive: true, force: true });
}
if (fs.existsSync('yarn.lock')) {
  fs.unlinkSync('yarn.lock');
}

// Cài đặt dependencies
console.log('\n📦 Đang cài đặt dependencies...');
if (!runCommand('yarn install', 'Cài đặt dependencies')) {
  process.exit(1);
}

// Cài đặt các dependencies bổ sung
console.log('\n🔧 Đang cài đặt các dependencies bổ sung...');
const additionalDeps = [
  'yarn add -D @types/react @types/react-native',
  'npx expo install react-native-screens react-native-safe-area-context'
];

for (const cmd of additionalDeps) {
  if (!runCommand(cmd, `Chạy lệnh: ${cmd}`)) {
    process.exit(1);
  }
}

// Khởi động dự án
console.log('\n🚀 Đang khởi động dự án...');
console.log('⏳ Vui lòng đợi trong giây lát...\n');
runCommand('npx expo start --clear', 'Khởi động Expo');
