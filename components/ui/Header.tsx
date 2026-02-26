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
    <header className="sticky top-0 z-50 w-full px-4 pt-4 md:px-8 md:pt-6 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        <div className="glass-card rounded-3xl px-6 md:px-10 py-5 flex justify-between items-center shadow-2xl shadow-indigo-500/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/30">
              <span className="text-white font-black text-xs">CP</span>
            </div>
            <div className="font-black text-lg tracking-tight text-gray-800 hidden sm:block">
              CodePool<span className="text-brand">-i</span>
            </div>
          </div>

          <div className="font-bold text-sm md:text-base tracking-tight text-gray-500 absolute left-1/2 -translate-x-1/2 hidden lg:block uppercase tracking-[0.2em]">
            Study Dashboard
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative flex items-center gap-1 group" ref={dropdownRef}>
              <Link
                href="/profile"
                className="flex items-center gap-2 cursor-pointer group/link"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand/10 border-2 border-white shadow-md flex items-center justify-center">
                    <span className="text-brand font-black text-xs">{user?.displayName?.charAt(0) || "U"}</span>
                  </div>
                )}
                <span className="text-sm font-bold text-gray-600 group-hover/link:text-brand transition hidden md:block">
                  내 프로필
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-brand focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              <div
                className={`absolute top-full right-0 mt-3 transition-all duration-300 z-50 ${
                  isDropdownOpen
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-4"
                }`}
              >
                <div className="glass-card shadow-2xl rounded-2xl overflow-hidden min-w-[200px] border border-white/60 p-1.5">
                  <Link
                    href="/theme"
                    onClick={() => setIsDropdownOpen(false)}
                    className="px-4 py-3 text-sm font-bold text-gray-600 hover:text-brand hover:bg-brand/5 rounded-xl flex items-center gap-3 transition-all"
                  >
                    <span className="text-lg">🎨</span>
                    테마 변경하기
                  </Link>
                  <div className="px-4 py-3 text-sm font-bold text-gray-300 flex items-center gap-3 cursor-default italic">
                    <span className="text-lg opacity-30">✨</span>
                    새 기능 준비중
                  </div>
                </div>
              </div>
            </div>

            <div className="w-px h-6 bg-gray-100 mx-2 hidden md:block" />

            <button
              onClick={onLogout}
              className="px-5 py-2.5 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-red-500 text-sm font-bold text-gray-500 transition-all border border-gray-100"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
