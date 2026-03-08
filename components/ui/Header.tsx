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
          <div className="relative group">
            <Link
              href="/profile"
              className="flex items-center gap-2 cursor-pointer"
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
            </Link>

            {/* 테마 변경 링크 (호버 시 나타남) */}
            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden min-w-[140px]">
                <Link
                  href="/theme"
                  className="px-4 py-2.5 text-[11px] font-bold text-gray-500 hover:text-brand hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-50"
                >
                  🎨 테마 변경하기
                </Link>
                <div className="px-4 py-2.5 text-[11px] font-bold text-gray-300 flex items-center gap-2 cursor-default bg-gray-50/30">
                  ✨ 새 기능 준비중
                </div>
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
