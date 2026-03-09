import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // API 키는 보안을 위해 Vercel 환경 변수에서 가져옵니다.
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,

  // 스크린샷과 보내주신 아이디를 바탕으로 작성된 고정값입니다.
  authDomain: "programmers-study.firebaseapp.com",
  projectId: "programmers-study",
  storageBucket: "programmers-study.appspot.com",
  messagingSenderId: "90152775832", 
  appId: "1:90152775832:web:01cad5255d74acd19da0ed"
};

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);

// 다른 파일에서 쓸 수 있도록 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


