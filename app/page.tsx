"use client";

import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // 🔹 role 확인
      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (userSnap.exists() && userSnap.data().role === "admin") {
        router.push("/admin");
      } else {
        router.push("/home");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    await signOut(auth);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    await signInWithPopup(auth, provider);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "50px",
          borderRadius: "18px",
          width: "500px",
          boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "13px" }}>
          오늘도 열심히 하는 코테 스터디 일원이 됩시다
        </h2>

        <button
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Google 로그인
        </button>
      </div>
    </div>
  );
}






