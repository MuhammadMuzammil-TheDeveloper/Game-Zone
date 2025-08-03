import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBBaNRM0fWua6mR0Hg4L-QjfNCvAROdEhk",
  authDomain: "qr-code-users-data.firebaseapp.com",
  projectId: "qr-code-users-data",
  storageBucket: "qr-code-users-data.appspot.com",
  messagingSenderId: "207489932245",
  appId: "1:207489932245:web:3709508924ae6c3b293b5c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;