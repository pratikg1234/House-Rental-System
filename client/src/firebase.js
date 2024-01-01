// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "house-rental-20349.firebaseapp.com",
  projectId: "house-rental-20349",
  storageBucket: "house-rental-20349.appspot.com",
  messagingSenderId: "974137279479",
  appId: "1:974137279479:web:fb4466c8f19951219da4f2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);