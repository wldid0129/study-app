"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface Exam {
    date: string;
    name: string;
}

export default function StudyCalendar({ exams }: { exams: Exam[] }) {
    const { currentColors } = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    const isExamDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return exams.find(e => e.date === dateStr);
    };

    return (
        <Card className="p-6 border-none shadow-md bg-white">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-xl text-gray-800 tracking-tight">
                    {year}년 {month + 1}월
                </h3>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-y-4 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-gray-300 uppercase">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-2">
                {days.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} />;

                    const exam = isExamDay(day);

                    return (
                        <div key={day} className="aspect-square flex flex-col items-center justify-center relative">
                            <span className={`text-sm font-bold ${exam ? 'text-white relative z-10' : 'text-gray-600'}`}>
                                {day}
                            </span>
                            {exam && (
                                <div
                                    className="absolute inset-1 rounded-xl shadow-sm"
                                    style={{ backgroundColor: currentColors.main }}
                                />
                            )}
                            {exam && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-[8px] px-1.5 py-0.5 rounded shadow-xl z-20 pointer-events-none font-bold">
                                    {exam.name}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Bookmark size={12} style={{ color: currentColors.main }} />
                    다가오는 주요 일정
                </h4>
                <div className="space-y-3">
                    {exams.length > 0 ? exams.map((e, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-700">{e.name}</span>
                            <span className="text-xs font-mono font-black" style={{ color: currentColors.main }}>{e.date}</span>
                        </div>
                    )) : (
                        <p className="text-xs text-gray-400 italic text-center py-2">등록된 일정이 없습니다.</p>
                    )}
                </div>
            </div>
        </Card>
    );
}
