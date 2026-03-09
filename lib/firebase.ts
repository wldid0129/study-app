import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // API 키는 이미 Vercel에 등록하셨으니 이대로 둡니다.
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,

  // 나머지 값들은 스크린샷에서 확인한 정보로 직접 채워 넣습니다.
  authDomain: "programmers-study.firebaseapp.com",
  projectId: "programmers-study",
  storageBucket: "programmers-study.appspot.com",
  
  // 아래 두 값은 파이어베이스 콘솔 '내 앱' 설정에서 확인 후 직접 수정해 주세요!
  messagingSenderId: "90152775832", // 스크린샷의 프로젝트 번호입니다.
  appId: "1:90152775832:web:여기에_본인의_AppID_입력" 
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


