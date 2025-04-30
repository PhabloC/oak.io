import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDYg2KYa6IuKtppDsBgzWhQNztH_i2Gr6g",
  authDomain: "oak-io.firebaseapp.com",
  projectId: "oak-io",
  storageBucket: "oak-io.firebasestorage.app",
  messagingSenderId: "1048829433175",
  appId: "1:1048829433175:web:2ad36b9464c82d3fae5a12",
  measurementId: "G-JDNSS86F74",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
