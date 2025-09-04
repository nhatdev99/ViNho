import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
// Lưu ý: Thay thế bằng thông tin Firebase project của bạn
const firebaseConfig = {
  apiKey: "AIzaSyD7PC7tzqDIwqxe1cYluZp8q6bR6jjGGVU",
  authDomain: "visicawr.firebaseapp.com",
  projectId: "visicawr",
  storageBucket: "visicawr.firebasestorage.app",
  messagingSenderId: "184475036261",
  appId: "1:184475036261:web:eef5d65a5a4b3d51f4348c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth - Firebase v12 tự động sử dụng AsyncStorage cho React Native
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
