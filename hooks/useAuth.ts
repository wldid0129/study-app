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

      /* =========================
         🔥 1. 이메일로 기존 유저 검색
      ========================= */

      const q = query(
        collection(db, "users"),
        where("email", "==", u.email)
      );

      const snapshot = await getDocs(q);

      let finalDocRef;

      if (!snapshot.empty) {
        // 기존 수동 유저 발견
        const existingDoc = snapshot.docs[0];

        finalDocRef = doc(db, "users", existingDoc.id);

        await updateDoc(finalDocRef, {
          uid: u.uid,
          legacy: false,
          photoURL: u.photoURL,
        });
      } else {
        // 완전 신규 유저
        finalDocRef = doc(db, "users", u.uid);

        await setDoc(finalDocRef, {
          email: u.email,
          name: u.displayName,
          photoURL: u.photoURL,
          role: "user",
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
