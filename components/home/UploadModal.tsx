"use client";

import React, { useEffect, useRef } from "react";

interface UploadModalProps {
  modalOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;

  selectedDate: string;
  setSelectedDate: (v: string) => void;

  file: File | null;
  setFile: (f: File | null) => void;

  previewUrl: string | null;
  setPreviewUrl: (v: string | null) => void;

  loading: boolean;
  progress: number;

  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;

  problemCount: number;
  setProblemCount: (n: number) => void;
}

export default function UploadModal({
  modalOpen,
  onClose,
  onSubmit,
  selectedDate,
  setSelectedDate,
  file,
  setFile,
  previewUrl,
  setPreviewUrl,
  loading,
  progress,
  fileInputRef,
  problemCount,
  setProblemCount,
}: UploadModalProps) {

  if (!modalOpen) return null;

  const firstRef = useRef<HTMLInputElement | null>(null);

  function safeClose() {
    const win = window as any;
    if (win.__modalLockCount) {
      win.__modalLockCount = 0;
    }
    if (win.__modalPrevPaddingRight !== undefined) {
      document.body.style.paddingRight = win.__modalPrevPaddingRight;
      win.__modalPrevPaddingRight = undefined;
    }
    document.body.style.overflow = win.__modalPrevOverflow ?? "";
    win.__modalPrevOverflow = undefined;
    try {
      onClose();
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    // lock background scroll while modal is open (reference-counted)
    const win = window as any;
    if (!win.__modalLockCount) {
      win.__modalLockCount = 0;
      win.__modalPrevOverflow = undefined;
      win.__modalPrevPaddingRight = undefined;
    }

    if (win.__modalLockCount === 0) {
      // preserve existing padding to avoid layout shift when removing scrollbar
      const scrollBarGap = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarGap > 0) {
        win.__modalPrevPaddingRight = document.body.style.paddingRight;
        document.body.style.paddingRight = `${scrollBarGap}px`;
      }
      win.__modalPrevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    win.__modalLockCount++;
    // focus the first input
    setTimeout(() => firstRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") safeClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      const win = window as any;
      if (win.__modalLockCount) {
        win.__modalLockCount--;
        if (win.__modalLockCount === 0) {
          if (win.__modalPrevPaddingRight !== undefined) {
            document.body.style.paddingRight = win.__modalPrevPaddingRight;
            win.__modalPrevPaddingRight = undefined;
          }
          document.body.style.overflow = win.__modalPrevOverflow ?? "";
          win.__modalPrevOverflow = undefined;
        }
      }
    };
  }, []);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      setProblemCount(0);
      return;
    }

    const num = Number(value);

    if (!isNaN(num) && num >= 0) {
      setProblemCount(num);
    }
  };

  const handleSubmit = () => {
    if (problemCount <= 0) {
      alert("총 문제 개수를 입력하세요.");
      return;
    }

    if (!file) {
      alert("이미지를 업로드하세요.");
      return;
    }

    onSubmit();
  };

  return (
    <div
      role="presentation"
      onClick={(e) => {
        // clicks on backdrop should close
        if (e.target === e.currentTarget) safeClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="출석 인증"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          padding: "28px",
          borderRadius: "14px",
          width: "420px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
        }}
      >
        <h3>출석 인증</h3>

        {/* 날짜 */}
        <div style={{ marginTop: "10px" }}>
          <label style={{ fontSize: "14px" }}>날짜 선택</label>
          <input
            ref={firstRef}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: "100%",
              marginTop: "4px",
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          />
        </div>

        {/* 총 문제 개수 */}
        <div style={{ marginTop: "15px" }}>
          <label style={{ fontSize: "14px" }}>총 문제 개수</label>
          <input
            type="number"
            min={0}
            value={problemCount}
            onChange={handleNumberChange}
            style={{
              width: "100%",
              marginTop: "4px",
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          />
        </div>

        {/* 업로드 */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (!f) return;
            setFile(f);
            setPreviewUrl(URL.createObjectURL(f));
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: "2px dashed #cbd5e1",
            padding: "30px",
            textAlign: "center",
            borderRadius: "14px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          파일 드래그 또는 클릭
        </div>

        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setFile(f);
              setPreviewUrl(URL.createObjectURL(f));
            }
          }}
        />

        {previewUrl && (
          <img
            src={previewUrl}
            style={{
              width: "100%",
              marginTop: "15px",
              borderRadius: "10px",
            }}
          />
        )}

        {loading && (
          <div
            style={{
              height: "8px",
              background: "#e5e7eb",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#4f46e5",
              }}
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            background: "#4f46e5",
            color: "white",
          }}
        >
          출석 인증
        </button>

        <button
          onClick={safeClose}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "8px",
            borderRadius: "10px",
            background: "#e5e7eb",
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
