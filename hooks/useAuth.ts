"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/");
        return;
      }

      setUser(u);

      const userEmail = u.email?.toLowerCase().trim();

      const q = query(
        collection(db, "users"),
        where("email", "==", userEmail)
      );

      const snapshot = await getDocs(q);

      let finalDocRef;

      if (!snapshot.empty) {
        // 기존 수동 유저 발견 (이메일 기준)
        const existingDoc = snapshot.docs[0];

        finalDocRef = doc(db, "users", existingDoc.id);

        await updateDoc(finalDocRef, {
          uid: u.uid, // 실제 Firebase UID로 업데이트
          legacy: false,
          photoURL: u.photoURL,
        });
      } else {
        // 완전 신규 유저
        finalDocRef = doc(db, "users", u.uid);

        await setDoc(finalDocRef, {
          email: userEmail,
          name: u.displayName,
          photoURL: u.photoURL,
          role: "viewer", // 기본 권한은 viewer (출석 전까지 인원수 제외)
          createdAt: serverTimestamp(),
          uid: u.uid,
          legacy: false,
        });
      }

      /* =========================
         🔥 2. 최종 문서로 admin 체크
      ========================= */

      const finalSnap = await getDoc(finalDocRef);

      if (
        finalSnap.exists() &&
        finalSnap.data().role === "admin"
      ) {
        setIsAdmin(true);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return {
    user,
    isAdmin,
    loading,
    logout,
  };
}
