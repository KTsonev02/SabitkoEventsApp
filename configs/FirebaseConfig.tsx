// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
//@ts-ignore
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import React from "react";

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxWuLCLIvazjbKaga1j-CctwimdDZOlLc",
  authDomain: "sabitko-app.firebaseapp.com",
  projectId: "sabitko-app",
  storageBucket: "sabitko-app.firebasestorage.app",
  messagingSenderId: "529830119902",
  appId: "1:529830119902:web:1003b84d1e26398fee354f",
  measurementId: "G-78E72MDX70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence:getReactNativePersistence(ReactNativeAsyncStorage)
});
// const analytics = getAnalytics(app);

// Инициализация на Firestore
export const db = getFirestore(app);

// Инициализация на Firebase Storage
export const storage = getStorage(app);
