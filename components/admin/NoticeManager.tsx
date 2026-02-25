"use client";

import Card from "@/components/ui/Card";
import { Trash2, Type, FileText } from "lucide-react";

interface Props {
  noticeTitle: string;
  setNoticeTitle: (v: string) => void;
  noticeContent: string;
  setNoticeContent: (v: string) => void;
  noticeList: any[];
  onSave: () => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  success?: boolean;
}

export default function NoticeManager({
  noticeTitle,
  setNoticeTitle,
  noticeContent,
  setNoticeContent,
  noticeList,
  onSave,
  onDelete,
  loading,
  success,
}: Props) {
  return (
    <div className="space-y-8">
      {/* ✍️ 새 공지 작성 */}
      <Card className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
            CREATE NEW NOTICE
          </div>
          {success && (
            <div className="text-xs text-green-600 font-bold animate-pulse">
              ✓ 저장 완료
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Type size={18} />
            </div>
            <input
              type="text"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              placeholder="공지사항 제목을 입력하세요 (예: 버전 2.0.0 업데이트 안내)"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm font-bold tracking-tight"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-6 text-gray-400">
              <FileText size={18} />
            </div>
            <textarea
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              placeholder="상세 내용을 입력하세요..."
              className="w-full min-h-[300px] pl-12 pr-4 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm leading-relaxed shadow-inner"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onSave}
            disabled={loading || !noticeTitle.trim() || !noticeContent.trim()}
            className={`px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm transition hover:bg-indigo-700 shadow-lg shadow-indigo-200 ${loading || !noticeTitle.trim() || !noticeContent.trim() ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "작성 중..." : "공지 올리기"}
          </button>
        </div>
      </Card>

      {/* 📋 공지 히스토리 목록 */}
      <Card className="p-8">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">
          NOTICE HISTORY ({noticeList.length})
        </div>

        <div className="space-y-4">
          {noticeList.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm italic">
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            noticeList.map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between p-5 bg-gray-50 rounded-2xl group hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter bg-indigo-50 px-2 py-0.5 rounded">
                      HOT
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {n.createdAt?.toDate
                        ? n.createdAt.toDate().toLocaleString()
                        : "방금 전"}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-gray-800 mb-1">
                    {n.title || "제목 없음"}
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed break-all line-clamp-1 group-hover:line-clamp-none transition-all">
                    {n.content}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(n.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
