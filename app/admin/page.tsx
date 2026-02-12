"use client";

import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  getDocs
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const router = useRouter();

  /* =========================================================
     🔹 AUTH STATE
  ========================================================= */
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  /* =========================================================
     🔹 PENDING LIST
  ========================================================= */
  const [attendances, setAttendances] = useState<any[]>([]);

  /* =========================================================
     🔹 NOTICE STATE
  ========================================================= */
  const [noticeId, setNoticeId] = useState<string | null>(null);
  const [noticeContent, setNoticeContent] = useState("");

  /* =========================================================
     🔹 ATTENDANCE STATUS BOARD STATE
  ========================================================= */
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceStatusList, setAttendanceStatusList] = useState<any[]>([]);

  /* =========================================================
     🔹 AUTH CHECK
  ========================================================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      setCurrentUser(user);

      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (userSnap.exists() && userSnap.data().role === "admin") {
        setIsAdmin(true);
        listenPending();
        listenNotice();
        loadAttendanceByDate(selectedDate);
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, []);

  /* =========================================================
     🔹 REALTIME PENDING LIST
  ========================================================= */
  const listenPending = () => {
    const q = query(
      collection(db, "attendances"),
      where("status", "==", "pending")
    );

    onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));
      setAttendances(list);
    });
  };

  /* =========================================================
     🔹 NOTICE LISTENER
  ========================================================= */
  const listenNotice = () => {
    const q = collection(db, "notices");

    onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docItem = snapshot.docs[0];
        setNoticeId(docItem.id);
        setNoticeContent(docItem.data().content);
      }
    });
  };

  /* =========================================================
     🔹 날짜별 전체 출석 조회
  ========================================================= */
  const loadAttendanceByDate = async (date: string) => {

    const usersSnap = await getDocs(collection(db, "users"));

    const attendSnap = await getDocs(
      query(
        collection(db, "attendances"),
        where("date", "==", date)
      )
    );

    const attendMap: any = {};
    attendSnap.forEach(doc => {
      const d = doc.data();
      attendMap[d.userId] = d.status;
    });

    const result: any[] = [];

    usersSnap.forEach(userDoc => {
      const userId = userDoc.id;
      const userData = userDoc.data();

      result.push({
        userId,
        name: userData.name || userData.email,
        status: attendMap[userId] || "none"
      });
    });

    setAttendanceStatusList(result);
  };

  useEffect(() => {
    if (isAdmin) {
      loadAttendanceByDate(selectedDate);
    }
  }, [selectedDate]);

  /* =========================================================
     🔹 승인/거절
  ========================================================= */
  const approveAttendance = async (id: string) => {
    await updateDoc(doc(db, "attendances", id), {
      status: "approved",
      approvedAt: serverTimestamp(),
    });
  };

  const rejectAttendance = async (id: string) => {
    await updateDoc(doc(db, "attendances", id), {
      status: "rejected",
    });
  };

  /* =========================================================
     🔹 공지 저장
  ========================================================= */
  const saveNotice = async () => {
    if (!noticeId) {
      await addDoc(collection(db, "notices"), {
        content: noticeContent,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, "notices", noticeId), {
        content: noticeContent,
        updatedAt: serverTimestamp(),
      });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (!isAdmin) return null;

  return (
    <div style={{ padding: "50px", background:"#f4f6f9", minHeight:"100vh" }}>

      {/* =========================================================
          🔹 HEADER
      ========================================================= */}
      <div style={{
        background:"white",
        padding:"25px 40px",
        borderRadius:"16px",
        marginBottom:"40px",
        boxShadow:"0 8px 20px rgba(0,0,0,0.05)",
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center"
      }}>
        <h2>관리자 페이지</h2>
        <button onClick={handleLogout}>로그아웃</button>
      </div>
      
      {/* =========================================================
          🔹 NOTICE MANAGEMENT
      ========================================================= */}
      <div style={{
        background:"white",
        padding:"40px",
        borderRadius:"20px",
        marginBottom:"50px",
        boxShadow:"0 8px 20px rgba(0,0,0,0.05)"
      }}>

        <h3 style={{marginBottom:"20px"}}>
          📢 공지사항 관리
        </h3>

        <textarea
          value={noticeContent}
          onChange={(e)=>setNoticeContent(e.target.value)}
          placeholder="공지 내용을 입력하세요"
          style={{
            width:"100%",
            minHeight:"120px",
            padding:"12px",
            borderRadius:"10px",
            border:"1px solid #ddd",
            marginBottom:"15px",
            fontSize:"14px"
          }}
        />

        <button
          onClick={saveNotice}
          style={{
            padding:"10px 20px",
            background:"#4f46e5",
            color:"white",
            border:"none",
            borderRadius:"10px",
            cursor:"pointer"
          }}
        >
          공지 저장
        </button>

      </div>


      {/* =========================================================
          🔹 날짜별 출석 현황 보드
      ========================================================= */}
      <div style={{
        background:"white",
        padding:"40px",
        borderRadius:"20px",
        marginBottom:"50px",
        boxShadow:"0 8px 20px rgba(0,0,0,0.05)"
      }}>

        <h3 style={{marginBottom:"20px"}}>📅 날짜별 출석 현황</h3>

        <input
          type="date"
          value={selectedDate}
          onChange={(e)=>setSelectedDate(e.target.value)}
          style={{
            marginBottom:"25px",
            padding:"8px 12px",
            borderRadius:"8px",
            border:"1px solid #ddd"
          }}
        />

        {attendanceStatusList.map(user=>(
          <div key={user.userId}
            style={{
              display:"flex",
              justifyContent:"space-between",
              padding:"12px 0",
              borderBottom:"1px solid #f1f1f1"
            }}
          >
            <div>{user.name}</div>

            <div>
              {user.status==="approved" && "출석 완료"}
              {user.status==="pending" && "승인 대기"}
              {user.status==="rejected" && "거절"}
              {user.status==="none" && "미출석"}
            </div>
          </div>
        ))}

      </div>

      {/* =========================================================
          🔹 승인 대기
      ========================================================= */}
      <div style={{
        background:"white",
        padding:"40px",
        borderRadius:"20px",
        boxShadow:"0 8px 20px rgba(0,0,0,0.05)"
      }}>
        <h3 style={{marginBottom:"20px"}}>📋 승인 대기</h3>

        {attendances.map(item=>(
          <div key={item.id} style={{marginBottom:"20px"}}>
            <div>{item.userId} - {item.date}</div>
            <img src={item.imageUrl} width="150"/>
            <div>
              <button onClick={()=>approveAttendance(item.id)}>승인</button>
              <button onClick={()=>rejectAttendance(item.id)}>거절</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
