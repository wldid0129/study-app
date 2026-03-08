"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface HeaderProps {
  user: any;
  onLogout: () => void;
}

export default function Header({
  user,
  onLogout,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
      <div className="bg-white shadow-md border border-gray-100 rounded-2xl px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full max-w-7xl mx-4 md:mx-0">

        <div className="font-bold text-lg text-brand">
          AIOT
        </div>

        <div className="font-black text-xl md:text-2xl tracking-tight text-gray-800 whitespace-nowrap">
          CodePool-i Study
        </div>

        <div className="flex items-center gap-6">
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border border-gray-200"
                />
              )}
              <span className="text-sm font-bold text-gray-600 group-hover:text-brand transition">
                내 프로필
              </span>
            </div>

            {/* 드롭다운 메뉴 (호버 및 클릭 토글 대응) */}
            <div className={`absolute top-full left-0 pt-2 transition-all duration-200 z-50 ${isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible md:group-hover:opacity-100 md:group-hover:visible'}`}>
              <div className="bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden min-w-[160px]">
                <Link
                  href="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="px-4 py-3 text-[12px] font-bold text-gray-500 hover:text-brand hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-50"
                >
                  💻 코테 공부방
                </Link>
                <Link
                  href="/study-room"
                  onClick={() => setIsDropdownOpen(false)}
                  className="px-4 py-3 text-[12px] font-bold text-gray-500 hover:text-brand hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-50"
                >
                  📚 개인 공부방
                </Link>
                <Link
                  href="/theme"
                  onClick={() => setIsDropdownOpen(false)}
                  className="px-4 py-3 text-[12px] font-bold text-gray-500 hover:text-brand hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  🎨 테마 변경하기
                </Link>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-500 transition"
          >
            로그아웃
          </button>
        </div>

      </div>
    </div>
  );
}
