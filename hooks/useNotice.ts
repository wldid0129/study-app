"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export function useNotice() {
  const [notice, setNotice] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "notices"),
      (snapshot) => {
        if (!snapshot.empty) {
          const d = snapshot.docs[0];
          setNotice({ id: d.id, ...d.data() });
        }
      }
    );

    return () => unsub();
  }, []);

  const saveNotice = async () => {
    if (!notice) return;

    await updateDoc(
      doc(db, "notices", notice.id),
      {
        content: editContent,
        updatedAt: serverTimestamp(),
      }
    );

    setEditing(false);
  };

  return {
    notice,
    editing,
    setEditing,
    editContent,
    setEditContent,
    saveNotice,
  };
}
