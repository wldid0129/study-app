import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBLMsOPL6yayCE9hhqPxPYewIqVVsH3xjs",
  authDomain: "programmers-study.firebaseapp.com",
  projectId: "programmers-study",
  storageBucket: "programmers-study.appspot.com",
  messagingSenderId: "90152775832",
  appId: "1:90152775832:web:01cad5255d74acd19da0ed",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


