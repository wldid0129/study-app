"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

export function useNotice() {
  const [notice, setNotice] = useState<any>(null);
  const [noticeList, setNoticeList] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNoticeList(list);
      if (list.length > 0) {
        setNotice(list[0]);
      }
    });

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
    noticeList,
    editing,
    setEditing,
    editContent,
    setEditContent,
    saveNotice,
  };
}
