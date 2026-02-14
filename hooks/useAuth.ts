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
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      async (u) => {
        if (!u) {
          router.push("/");
          return;
        }

        setUser(u);

        const userSnap = await getDoc(
          doc(db, "users", u.uid)
        );

        if (
          userSnap.exists() &&
          userSnap.data().role === "admin"
        ) {
          setIsAdmin(true);
        }

        setLoading(false);
      }
    );

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
