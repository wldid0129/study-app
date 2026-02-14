interface NoticeCardProps {
  notice: any;
}

export default function NoticeCard({ notice }: NoticeCardProps) {
  return (
    <div
      style={{
        background: "white",
        padding: "45px",
        borderRadius: "24px",
        marginBottom: "60px",
        boxShadow: "0 14px 35px rgba(0,0,0,0.06)",
        border: "1px solid #eef2f7",
      }}
    >
      <div
        style={{
          background: "#f1f5ff",
          padding: "14px 22px",
          borderRadius: "14px",
          display: "inline-block",
          marginBottom: "25px",
          fontSize: "20px",
          fontWeight: 700,
        }}
      >
        📢 공지사항
      </div>

      <div
        style={{
          fontSize: "16px",
          lineHeight: "1.8",
          color: "#374151",
          whiteSpace: "pre-line",
        }}
      >
        {notice?.content || "등록된 공지가 없습니다."}
      </div>
    </div>
  );
}
