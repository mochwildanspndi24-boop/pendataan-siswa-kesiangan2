import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  remove,
  push,
  serverTimestamp,
  increment,
  off,
  child,
  query,
  orderByKey,
  limitToLast,
} from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCsgvqHQpz2U7EBfZuv9nVmwyW9aGFccIQ",
  authDomain: "pendataan-kesiangan2026.firebaseapp.com",
  databaseURL: "https://pendataan-kesiangan2026-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pendataan-kesiangan2026",
  storageBucket: "pendataan-kesiangan2026.firebasestorage.app",
  messagingSenderId: "1061822113454",
  appId: "1:1061822113454:web:e0aafcc68391489ab56f3f",
  measurementId: "G-5BPX7QW80F",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export {
  ref,
  set,
  get,
  update,
  onValue,
  remove,
  push,
  serverTimestamp,
  increment,
  off,
  child,
  query,
  orderByKey,
  limitToLast,
};
