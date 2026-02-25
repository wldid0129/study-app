"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
    where,
} from "firebase/firestore";

export interface InteractionMessage {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    content: string;
    type: 'feedback' | 'qna';
    createdAt: any;
    answer?: string;
    answeredAt?: any;
    isRead?: boolean; // 읽음 상태 추가
}

export function useInteraction(user: { uid: string } | null, isAdmin: boolean = false) {
    const [messages, setMessages] = useState<InteractionMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user && !isAdmin) {
            setMessages([]);
            setLoading(false);
            return;
        }

        let q;
        if (isAdmin) {
            q = query(
                collection(db, "interactions"),
                orderBy("createdAt", "desc")
            );
        } else if (user) {
            q = query(
                collection(db, "interactions"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
            );
        } else {
            setLoading(false);
            return;
        }

        const unsub = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as InteractionMessage[];
            setMessages(list);
            setLoading(false);
        });

        return () => unsub();
    }, [user?.uid, isAdmin]);

    const addMessage = async (
        type: 'feedback' | 'qna',
        content: string,
        userData: { uid: string; displayName?: string | null; email?: string | null }
    ) => {
        if (!content.trim()) return;

        try {
            await addDoc(collection(db, "interactions"), {
                userId: userData.uid,
                userName: type === 'feedback' ? "익명 사용자" : (userData.displayName || "Unknown"),
                userEmail: type === 'feedback' ? "" : (userData.email || ""),
                realName: userData.displayName || "Unknown",
                realEmail: userData.email || "",
                content,
                type,
                createdAt: serverTimestamp(),
                isRead: true, // 사용자가 직접 쓴 것은 읽은 것으로 간주
            });
        } catch (e) {
            console.error("Error adding message:", e);
            throw e;
        }
    };

    const saveAnswer = async (id: string, answer: string) => {
        try {
            const docRef = doc(db, "interactions", id);
            await updateDoc(docRef, {
                answer,
                answeredAt: serverTimestamp(),
                isRead: false, // 답변이 달리면 '안읽음' 상태로 변경하여 사용자에게 알림
            });
        } catch (e) {
            console.error("Error saving answer:", e);
            throw e;
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            const unreadMessages = messages.filter(m => m.isRead === false);
            if (unreadMessages.length === 0) return;

            const promises = unreadMessages.map(m =>
                updateDoc(doc(db, "interactions", m.id), { isRead: true })
            );
            await Promise.all(promises);
        } catch (e) {
            console.error("Error marking messages as read:", e);
        }
    };

    const deleteMessage = async (id: string) => {
        try {
            await deleteDoc(doc(db, "interactions", id));
        } catch (e) {
            console.error("Error deleting message:", e);
            throw e;
        }
    };

    return {
        messages,
        loading,
        addMessage,
        saveAnswer,
        markAllAsRead,
        deleteMessage,
    };
}
