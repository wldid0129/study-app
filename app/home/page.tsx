"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  /* =========================================================
     🔹 AUTH STATE
  ========================================================= */
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  /* =========================================================
     🔹 NOTICE STATE
  ========================================================= */
  const [notice, setNotice] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  /* =========================================================
     🔹 ATTENDANCE STATE
  ========================================================= */
  const [attendanceMap, setAttendanceMap] =
    useState<Record<string, string>>({});
  const [totalMap, setTotalMap] =
    useState<Record<string, number>>({});
  const [userCount, setUserCount] = useState(1);
  const [streak, setStreak] = useState(0);
  const [activeTab, setActiveTab] =
    useState<"total" | "personal">("total");

  /* =========================================================
     🔹 CALENDAR STATE
  ========================================================= */
  const [currentMonth, setCurrentMonth] = useState(new Date());


  /* =========================================================
     🔹 UPLOAD MODAL STATE
  ========================================================= */
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  /* =========================================================
   🔹 STATISTICS STATE
  ========================================================= */
  const [monthlyTop, setMonthlyTop] = useState<any[]>([]);
  const [weeklyTop, setWeeklyTop] = useState<any[]>([]);
  const [todayRate, setTodayRate] = useState(0);


  /* =========================================================
     🔹 AUTH LISTENER
  ========================================================= */
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
        )
          setIsAdmin(true);

        const usersSnap = await getDocs(
          collection(db, "users")
        );
        setUserCount(usersSnap.size || 1);

        listenNotice();
        listenPersonal(u.uid);
        listenMonthlyTotals();

      }
    );

    return () => unsub();
  }, []);

  /* =========================================================
   🔹 REALTIME NOTICE LISTENER
  ========================================================= */
  const listenNotice = () => {
    const q = collection(db, "notices");

    onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        setNotice({ id: d.id, ...d.data() });
      }
    });
  };  


  /* =========================================================
     🔹 NOTICE
  ========================================================= */

  const saveNotice = async () => {
    await updateDoc(doc(db, "notices", notice.id), {
      content: editContent,
      updatedAt: serverTimestamp(),
    });
    setEditing(false);
  };

  /* =========================================================
     🔹 PERSONAL ATTENDANCE REALTIME
  ========================================================= */
  const listenPersonal = (uid: string) => {
    const q = query(
      collection(db, "attendances"),
      where("userId", "==", uid)
    );

    onSnapshot(q, (snapshot) => {
      const map: any = {};
      const approvedDates: string[] = [];

      snapshot.forEach((doc) => {
        const d = doc.data();
        map[d.date] = d.status;
        if (d.status === "approved")
          approvedDates.push(d.date);
      });

      setAttendanceMap(map);
      calculateStreak(approvedDates);
    });
  };

  /* =========================================================
     🔹 MONTHLY TOTAL REALTIME
  ========================================================= */
  const listenMonthlyTotals = () => {
    const q = collection(db, "attendances");

    onSnapshot(q, (snapshot) => {
      const map: any = {};
      snapshot.forEach((doc) => {
        const d = doc.data();
        if (d.status === "approved") {
          map[d.date] =
            (map[d.date] || 0) + 1;
        }
      });
      setTotalMap(map);

      calculateStats(snapshot);
    });
  };

  /* =========================================================
   🔹 CALCULATE STATISTICS
  ========================================================= */
  const calculateStats = (snapshot: any) => {
    const now = new Date();
    const todayKey = now.toISOString().split("T")[0];

    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 6);

    const monthlyCount: any = {};
    const weeklyCount: any = {};
    let todayCount = 0;

    snapshot.forEach((docItem: any) => {
      const d = docItem.data();
      if (d.status !== "approved") return;

      const dateObj = new Date(d.date);

      // 월간
      if (
        dateObj.getMonth() === now.getMonth() &&
        dateObj.getFullYear() === now.getFullYear()
      ) {
        monthlyCount[d.userId] =
          (monthlyCount[d.userId] || 0) + 1;
      }

      // 주간
      if (dateObj >= weekAgo) {
        weeklyCount[d.userId] =
          (weeklyCount[d.userId] || 0) + 1;
      }

      // 오늘
      if (d.date === todayKey) {
        todayCount++;
      }
    });

    const sortDesc = (obj: any) =>
      Object.entries(obj)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 3);

    setMonthlyTop(sortDesc(monthlyCount));
    setWeeklyTop(sortDesc(weeklyCount));
    setTodayRate(
      userCount > 0
        ? Math.round((todayCount / userCount) * 100)
        : 0
    );

  };


  /* =========================================================
     🔹 STREAK
  ========================================================= */
  const calculateStreak = (dates: string[]) => {
    const today = new Date();
    let count = 0;

    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = d
        .toISOString()
        .split("T")[0];
      if (dates.includes(key)) count++;
      else break;
    }

    setStreak(count);
  };

  /* =========================================================
     🔹 CLOUDINARY UPLOAD
  ========================================================= */
  const uploadToCloudinary = (file: File) => {
    return new Promise<string>((resolve) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        "attendance_preset"
      );

      xhr.open(
        "POST",
        "https://api.cloudinary.com/v1_1/duu9ene1v/image/upload"
      );

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable)
          setProgress(
            Math.round(
              (e.loaded / e.total) * 100
            )
          );
      };

      xhr.onload = () => {
        const data = JSON.parse(
          xhr.responseText
        );
        resolve(data.secure_url);
      };

      xhr.send(formData);
    });
  };

  /* =========================================================
     🔹 ATTENDANCE SUBMIT
  ========================================================= */
  const handleAttendance = async () => {
    if (!file || !user) return;

    /* =========================================================
      🔹 미래 날짜 업로드 방지
    ========================================================= */
    const todayReal = new Date()
      .toISOString()
      .split("T")[0];

    if (selectedDate > todayReal) {
      alert("미래 날짜는 선택 불가");
      return;
    }

    const today = selectedDate;

    if (attendanceMap[today]) {
      alert("이미 출석 기록 존재");
      return;
    }

    setLoading(true);


    const imageUrl =
      await uploadToCloudinary(file);

    await addDoc(collection(db, "attendances"), {
      userId: user.uid,
      date: today,
      imageUrl,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    setLoading(false);
    setModalOpen(false);
    setFile(null);
    setPreviewUrl(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  /* =========================================================
     🔹 CALENDAR LOGIC
  ========================================================= */
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();
  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const getColor = (percent: number) => {
    if (percent === 0) return "#f3f4f6";
    if (percent < 30) return "#c7d2fe";
    if (percent < 60) return "#818cf8";
    return "#4f46e5";
  };

  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh" }}>

      {/* =========================================================
          🔹 HEADER CARD
      ========================================================= */}
      <div style={{
        background:"white",
        padding:"24px 50px",
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        boxShadow:"0 8px 20px rgba(0,0,0,0.05)"
      }}>
        <div style={{fontWeight:700,fontSize:"20px"}}>
          AIOT
        </div>

        <div style={{fontWeight:700,fontSize:"22px"}}>
          CodePool-i Study
        </div>

        <div style={{display:"flex",gap:"16px",alignItems:"center"}}>
          <span>{user?.email}</span>
          <button
            onClick={handleLogout}
            style={{
              background:"#e5e7eb",
              padding:"8px 14px",
              borderRadius:"10px"
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      <div style={{padding:"50px"}}>

        {/* =========================================================
    🔹 NOTICE CARD
          ========================================================= */}
          <div style={{
            background:"white",
            padding:"45px",
            borderRadius:"24px",
            marginBottom:"60px",
            boxShadow:"0 14px 35px rgba(0,0,0,0.06)",
            border:"1px solid #eef2f7"
          }}>

            {/* 🔹 NOTICE TITLE CARD */}
            <div style={{
              background:"#f1f5ff",
              padding:"14px 22px",
              borderRadius:"14px",
              display:"inline-block",
              marginBottom:"25px",
              fontSize:"20px",
              fontWeight:700,
              color:"#000000"
            }}>
              📢 공지사항
            </div>

            {/* 🔹 NOTICE CONTENT */}
            <div style={{
              fontSize:"16px",
              lineHeight:"1.8",
              color:"#374151",
              whiteSpace:"pre-line"
            }}>
              {notice?.content || "등록된 공지가 없습니다."}
            </div>

          </div>


        {/* =========================================================
            🔹 CONTENT GRID
        ========================================================= */}
        <div style={{display:"flex",gap:"40px"}}>

          {/* =========================================================
              🔹 STREAK CARD (CENTER)
          ========================================================= */}
          <div style={{
            flex:1,
            background:"white",
            padding:"40px",
            borderRadius:"20px",
            boxShadow:"0 8px 20px rgba(0,0,0,0.05)",
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"center",
            textAlign:"center"
          }}>
            <div style={{marginBottom:"10px"}}>
              🔥 My Streak
            </div>
            <div style={{
              fontSize:"48px",
              fontWeight:700
            }}>
              {streak} days
            </div>
          </div>

          {/* =========================================================
              🔹 CALENDAR CARD
          ========================================================= */}
          <div style={{
            flex:3,
            background:"white",
            padding:"40px",
            borderRadius:"20px",
            boxShadow:"0 8px 20px rgba(0,0,0,0.05)"
          }}>

            {/* 🔹 MONTH HEADER */}
            <div style={{
              display:"flex",
              justifyContent:"center",
              alignItems:"center",
              gap:"20px",
              marginBottom:"30px"
            }}>
              <button
                onClick={()=>{
                  const d = new Date(currentMonth);
                  d.setMonth(d.getMonth()-1);
                  setCurrentMonth(d);
                }}
                style={{
                  padding:"6px 12px",
                  borderRadius:"8px",
                  background:"#e5e7eb"
                }}
              >
                ◀
              </button>

              <div style={{
                fontSize:"20px",
                fontWeight:600
              }}>
                {year}년 {month+1}월
              </div>

              <button
                onClick={()=>{
                  const d = new Date(currentMonth);
                  d.setMonth(d.getMonth()+1);
                  setCurrentMonth(d);
                }}
                style={{
                  padding:"6px 12px",
                  borderRadius:"8px",
                  background:"#e5e7eb"
                }}
              >
                ▶
              </button>
            </div>
            
            

            {/* =========================================================
                🔹 TABS + BUTTON
            ========================================================= */}
            <div style={{
              display:"flex",
              justifyContent:"space-between",
              marginBottom:"30px"
            }}>
              <div style={{display:"flex",gap:"12px"}}>
                <button
                  onClick={()=>setActiveTab("total")}
                  style={{
                    padding:"8px 16px",
                    borderRadius:"10px",
                    background: activeTab==="total"
                      ? "#e0e7ff"
                      : "#f3f4f6"
                  }}
                >
                  이번 달 참여현황
                </button>

                <button
                  onClick={()=>setActiveTab("personal")}
                  style={{
                    padding:"8px 16px",
                    borderRadius:"10px",
                    background: activeTab==="personal"
                      ? "#e0e7ff"
                      : "#f3f4f6"
                  }}
                >
                  내 출석 현황
                </button>
              </div>

              {activeTab==="personal" && (
                <button
                  onClick={()=>setModalOpen(true)}
                  style={{
                    background:"#4f46e5",
                    color:"white",
                    padding:"10px 20px",
                    borderRadius:"12px"
                  }}
                >
                  출석하기
                </button>
              )}
            </div>

            {/* =========================================================
                🔹 CALENDAR GRID
            ========================================================= */}
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(7,1fr)",
              gap:"10px"
            }}>
              {[...Array(firstDay)].map((_,i)=>
                <div key={i}/>
              )}

              {[...Array(daysInMonth)].map((_,i)=>{
                const day=i+1;
                const key=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const status=attendanceMap[key];
                const total=totalMap[key]||0;
                const percent=Math.round((total/userCount)*100);

                return (
                  <div key={day}
                    style={{
                      height:"90px",
                      borderRadius:"14px",
                      padding:"10px",
                      background: activeTab==="total"
                        ? getColor(percent)
                        : "#f3f4f6",
                      color: activeTab==="total" && percent>50 ? "white":"black"
                    }}>

                    <div style={{fontSize:"12px"}}>
                      {day}
                    </div>

                    {activeTab==="total" && (
                      <div style={{fontSize:"12px"}}>
                        {percent}%
                      </div>
                    )}

                    {activeTab==="personal" && (
                      <div style={{marginTop:"10px"}}>
                        {status==="approved" && (
                          <span style={{
                            padding:"4px 8px",
                            background:"#dcfce7",
                            borderRadius:"999px",
                            fontSize:"12px"
                          }}>
                            출석 완료
                          </span>
                        )}

                        {status==="pending" && (
                          <span style={{
                            padding:"4px 8px",
                            background:"#fef9c3",
                            borderRadius:"999px",
                            fontSize:"12px"
                          }}>
                            출석 대기
                          </span>
                        )}

                        {!status && (
                          <span style={{
                            padding:"4px 8px",
                            background:"#e5e7eb",
                            borderRadius:"999px",
                            fontSize:"12px"
                          }}>
                            미출석
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================
        🔹 STATISTICS SECTION (ALIGNED VERSION)
    ========================================================= 
    <div style={{
      marginTop:"70px",
      display:"flex",
      gap:"40px"
    }}>

      {/* 오늘 참여율 (왼쪽 1비율 - streak와 맞춤)
      <div style={{
        flex:1,
        background:"white",
        padding:"40px",
        borderRadius:"20px",
        boxShadow:"0 8px 20px rgba(0,0,0,0.05)"
      }}>
        <div style={{
          fontSize:"14px",
          color:"#9ca3af",
          marginBottom:"15px"
        }}>
          TODAY ATTENDANCE
        </div>

        <div style={{
          fontSize:"44px",
          fontWeight:700,
          color:"#040404"
        }}>
          {todayRate}%
        </div>
      </div>


      {/* 오른쪽 통계 그룹 (calendar와 폭 맞춤) 
        flex:3,
        display:"flex",
        gap:"40px"
      }}>

        {/* 월간 TOP3 
        <div style={{
          flex:1,
          background:"white",
          padding:"40px",
          borderRadius:"20px",
          boxShadow:"0 8px 20px rgba(0,0,0,0.05)"
        }}>
          <div style={{
            fontSize:"14px",
            color:"#9ca3af",
            marginBottom:"20px"
          }}>
            MONTHLY TOP 3
          </div>

          {monthlyTop.map((item, index) => (
            <div key={index}
              style={{
                display:"flex",
                justifyContent:"space-between",
                marginBottom:"10px",
                fontWeight:index===0?700:500
              }}>
              <span>{index+1}. {item[0]}</span>
              <span>{item[1]}회</span>
            </div>
          ))}
        </div>


        {/* 주간 TOP3 
        <div style={{
          flex:1,
          background:"white",
          padding:"40px",
          borderRadius:"20px",
          boxShadow:"0 8px 20px rgba(0,0,0,0.05)"
        }}>
          <div style={{
            fontSize:"14px",
            color:"#9ca3af",
            marginBottom:"20px"
          }}>
            WEEKLY TOP 3
          </div>

          {weeklyTop.map((item, index) => (
            <div key={index}
              style={{
                display:"flex",
                justifyContent:"space-between",
                marginBottom:"10px",
                fontWeight:index===0?700:500
              }}>
              <span>{index+1}. {item[0]}</span>
              <span>{item[1]}회</span>
            </div>
          ))}
        </div>

      </div>

      </div> */}

    </div>
      
    


      

      {/* =========================================================
          🔹 UPLOAD MODAL
      ========================================================= */}
      {modalOpen && (
        <div style={{
          position:"fixed",
          inset:0,
          background:"rgba(0,0,0,0.5)",
          display:"flex",
          justifyContent:"center",
          alignItems:"center"
        }}>
          <div style={{
            background:"white",
            padding:"40px",
            borderRadius:"20px",
            width:"420px"
          }}>
            <h3>사진 업로드</h3>
            <div style={{ marginTop: "10px" }}>
              <label style={{ fontSize: "14px" }}>
                날짜 선택
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e)=>setSelectedDate(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "4px",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb"
                }}
              />
            </div>

            {/* UPLOAD ZONE */}
            <div
              onDragOver={(e)=>e.preventDefault()}
              onDrop={(e)=>{
                e.preventDefault();
                const f=e.dataTransfer.files[0];
                setFile(f);
                setPreviewUrl(URL.createObjectURL(f));
              }}
              onClick={()=>fileInputRef.current?.click()}
              style={{
                border:"2px dashed #cbd5e1",
                padding:"30px",
                textAlign:"center",
                borderRadius:"14px",
                cursor:"pointer",
                marginTop:"20px"
              }}>
              파일 드래그 또는 클릭
            </div>

            <input
              ref={fileInputRef}
              type="file"
              style={{display:"none"}}
              onChange={(e)=>{
                const f=e.target.files?.[0];
                if(f){
                  setFile(f);
                  setPreviewUrl(URL.createObjectURL(f));
                }
              }}
            />

            {/* PREVIEW */}
            {previewUrl && (
              <img
                src={previewUrl}
                style={{
                  width:"100%",
                  marginTop:"15px",
                  borderRadius:"10px"
                }}
              />
            )}

            {/* PROGRESS */}
            {loading && (
              <div style={{
                height:"8px",
                background:"#e5e7eb",
                marginTop:"10px"
              }}>
                <div style={{
                  width:`${progress}%`,
                  height:"100%",
                  background:"#4f46e5"
                }}/>
              </div>
            )}

            <button
              onClick={handleAttendance}
              disabled={loading}
              style={{
                marginTop:"20px",
                width:"100%",
                padding:"10px",
                borderRadius:"10px",
                background:"#4f46e5",
                color:"white"
              }}>
              출석 인증
            </button>

            <button
              onClick={()=>setModalOpen(false)}
              style={{
                marginTop:"10px",
                width:"100%",
                padding:"8px",
                borderRadius:"10px",
                background:"#e5e7eb"
              }}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
