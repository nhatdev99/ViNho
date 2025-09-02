// Khai báo kiểu cho các biến toàn cục
declare const _GLOBAL_: any;
interface Window {
  __DEV__?: boolean;
  HermesInternal?: any;
  [key: string]: any;
}

declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// Bỏ qua lỗi kiểm tra type cho các module trong node_modules
declare module 'expo-modules-core' {
  export * from 'expo-modules-core/src';
}

// Khai báo kiểu cho các module không có type definitions
declare module 'expo/tsconfig.base.json' {
  const value: any;
  export default value;
}
