"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/ui/Header";
import Card from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Briefcase, BookOpen, Calendar, Trash2, ListTodo, CheckCircle2, Circle, Plus, ChevronLeft, ChevronRight, Bookmark, X } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import QuickLinksHub from "@/components/home/QuickLinksHub";

/* ==============================
   인라인 달력 (좌측 패널 고정)
============================== */
function InlineCalendar({ exams, onAddExam, onRemoveExam, currentColors }: {
    exams: { date: string; name: string }[];
    onAddExam: (exam: { date: string; name: string }) => void;
    onRemoveExam: (index: number) => void;
    currentColors: any;
}) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showAddForm, setShowAddForm] = useState(false);
    const [newExamName, setNewExamName] = useState("");
    const [newExamDate, setNewExamDate] = useState("");

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const isExamDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return exams.find(e => e.date === dateStr);
    };

    const today = new Date();
    const isToday = (day: number) =>
        today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

    const handleAddExam = () => {
        if (!newExamName.trim() || !newExamDate) return;
        onAddExam({ date: newExamDate, name: newExamName.trim() });
        setNewExamName("");
        setNewExamDate("");
        setShowAddForm(false);
    };

    return (
        <div className="flex flex-col h-full">
            {/* 달력 헤더 */}
            <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-lg text-gray-800 tracking-tight">
                    {year}년 {month + 1}월
                </h3>
                <div className="flex gap-1">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-y-1 mb-1">
                {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                    <div key={d} className="text-center text-[9px] font-black text-gray-300 uppercase">{d}</div>
                ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-y-1 flex-1">
                {days.map((day, idx) => {
                    if (!day) return <div key={`e-${idx}`} />;
                    const exam = isExamDay(day);
                    return (
                        <div key={day} className="relative flex items-center justify-center aspect-square group cursor-default">
                            <span className={`text-xs font-bold relative z-10 ${exam ? 'text-white' : isToday(day) ? 'text-brand' : 'text-gray-500'}`}>
                                {day}
                            </span>
                            {exam && (
                                <div className="absolute inset-0.5 rounded-lg" style={{ backgroundColor: currentColors.main }} />
                            )}
                            {isToday(day) && !exam && (
                                <div className="absolute inset-0.5 rounded-lg border-2" style={{ borderColor: currentColors.main }} />
                            )}
                            {exam && (
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-[8px] px-1.5 py-0.5 rounded shadow-xl z-30 pointer-events-none font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    {exam.name}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 다가오는 일정 리스트 */}
            <div className="mt-auto pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Bookmark size={10} style={{ color: currentColors.main }} />
                        다가오는 일정
                    </h4>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                        style={{ color: currentColors.main }}
                    >
                        {showAddForm ? <X size={12} /> : <Plus size={12} />}
                    </button>
                </div>

                {/* 일정 추가 폼 */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden mb-2"
                        >
                            <div className="p-2.5 bg-gray-50 rounded-xl space-y-2">
                                <input
                                    type="text"
                                    value={newExamName}
                                    onChange={(e) => setNewExamName(e.target.value)}
                                    placeholder="일정 이름"
                                    className="w-full bg-white rounded-lg px-2.5 py-1.5 text-[11px] font-medium outline-none border border-gray-100 focus:border-brand transition-colors"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={newExamDate}
                                        onChange={(e) => setNewExamDate(e.target.value)}
                                        className="flex-1 bg-white rounded-lg px-2.5 py-1.5 text-[11px] font-medium outline-none border border-gray-100 focus:border-brand transition-colors"
                                    />
                                    <button
                                        onClick={handleAddExam}
                                        className="px-3 py-1.5 rounded-lg text-white text-[10px] font-bold hover:opacity-90 transition-opacity"
                                        style={{ backgroundColor: currentColors.main }}
                                    >
                                        추가
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-1.5">
                    {exams.length > 0 ? exams.map((e, i) => (
                        <div key={i} className="flex justify-between items-center group">
                            <span className="text-[11px] font-bold text-gray-600">{e.name}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono font-black" style={{ color: currentColors.main }}>{e.date}</span>
                                <button
                                    onClick={() => onRemoveExam(i)}
                                    className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-[11px] text-gray-300 italic">등록된 일정이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ==============================
   인라인 목표 관리 (우측 패널)
============================== */
function InlineGoals({ currentColors }: { currentColors: any }) {
    const [todos, setTodos] = useState<{ id: number; text: string; done: boolean }[]>([]);
    const [input, setInput] = useState("");

    const toggleTodo = (id: number) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
    const deleteTodo = (id: number) => setTodos(todos.filter(t => t.id !== id));
    const addTodo = () => {
        if (!input.trim()) return;
        setTodos([...todos, { id: Date.now(), text: input, done: false }]);
        setInput("");
    };
    const doneCount = todos.filter(t => t.done).length;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <ListTodo size={18} style={{ color: currentColors.main }} />
                    <h3 className="font-black text-lg text-gray-800 tracking-tight">오늘의 목표</h3>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: currentColors.light, color: currentColors.main }}>
                    {doneCount}/{todos.length}
                </span>
            </div>

            {/* 진행률 바 */}
            <div className="h-1.5 bg-gray-100 rounded-full mb-5 overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: currentColors.main }}
                    initial={{ width: 0 }}
                    animate={{ width: `${todos.length > 0 ? (doneCount / todos.length) * 100 : 0}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
                {todos.map(todo => (
                    <div
                        key={todo.id}
                        className={`flex items-center gap-2.5 p-3 rounded-xl transition-all group ${todo.done ? 'opacity-50' : 'bg-white shadow-sm border border-gray-50 hover:shadow-md'}`}
                    >
                        <div
                            onClick={() => toggleTodo(todo.id)}
                            className="cursor-pointer flex-shrink-0"
                        >
                            {todo.done ? (
                                <CheckCircle2 size={16} style={{ color: currentColors.main }} />
                            ) : (
                                <Circle size={16} className="text-gray-200" />
                            )}
                        </div>
                        <span className={`text-sm font-bold flex-1 ${todo.done ? 'text-gray-300 line-through' : 'text-gray-700'}`}>
                            {todo.text}
                        </span>
                        <button
                            onClick={() => deleteTodo(todo.id)}
                            className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="새 목표 입력..."
                    className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 transition-all border-none" style={{ '--tw-ring-color': currentColors.light } as any}
                />
                <button
                    onClick={addTodo}
                    className="p-2.5 rounded-xl text-white shadow-md hover:scale-105 active:scale-95 transition-all"
                    style={{ backgroundColor: currentColors.main }}
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
}

/* ==============================
   자격증/공모전 관리 (우측 패널)
============================== */
function CertCompSection({ currentColors }: { currentColors: any }) {
    const [certs, setCerts] = useState<{ name: string; date: string; org: string }[]>([]);
    const [comps, setComps] = useState<{ name: string; date: string; status: string; result: string }[]>([]);

    const [showCertForm, setShowCertForm] = useState(false);
    const [showCompForm, setShowCompForm] = useState(false);
    const [certForm, setCertForm] = useState({ name: "", date: "", org: "" });
    const [compForm, setCompForm] = useState({ name: "", date: "", status: "진행 중", result: "-" });

    const addCert = () => {
        if (!certForm.name.trim() || !certForm.date) return;
        setCerts([...certs, { ...certForm }]);
        setCertForm({ name: "", date: "", org: "" });
        setShowCertForm(false);
    };

    const addComp = () => {
        if (!compForm.name.trim() || !compForm.date) return;
        setComps([...comps, { ...compForm }]);
        setCompForm({ name: "", date: "", status: "진행 중", result: "-" });
        setShowCompForm(false);
    };

    return (
        <div className="space-y-6">
            {/* 자격증 */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Award size={16} style={{ color: currentColors.main }} />
                        취득 자격증
                    </h3>
                    <button
                        onClick={() => setShowCertForm(!showCertForm)}
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg hover:opacity-80 transition-opacity text-white"
                        style={{ backgroundColor: currentColors.main }}
                    >
                        {showCertForm ? <X size={10} /> : <Plus size={10} />}
                        {showCertForm ? '닫기' : '추가'}
                    </button>
                </div>

                {/* 자격증 추가 폼 */}
                <AnimatePresence>
                    {showCertForm && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden mb-3"
                        >
                            <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                                <input
                                    type="text" value={certForm.name} onChange={e => setCertForm({ ...certForm, name: e.target.value })}
                                    placeholder="자격증 이름" className="w-full bg-white rounded-lg px-3 py-2 text-xs font-medium outline-none border border-gray-100 focus:border-brand transition-colors"
                                />
                                <input
                                    type="text" value={certForm.org} onChange={e => setCertForm({ ...certForm, org: e.target.value })}
                                    placeholder="발급 기관" className="w-full bg-white rounded-lg px-3 py-2 text-xs font-medium outline-none border border-gray-100 focus:border-brand transition-colors"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="date" value={certForm.date} onChange={e => setCertForm({ ...certForm, date: e.target.value })}
                                        className="flex-1 bg-white rounded-lg px-3 py-2 text-xs font-medium outline-none border border-gray-100 focus:border-brand transition-colors"
                                    />
                                    <button onClick={addCert} className="px-4 py-2 rounded-lg text-white text-xs font-bold hover:opacity-90 transition-opacity" style={{ backgroundColor: currentColors.main }}>
                                        등록
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {certs.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-sm text-gray-800">{item.name}</h4>
                                <button onClick={() => setCerts(certs.filter((_, i) => i !== idx))} className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <p className="text-[11px] text-gray-400 mb-2">{item.org}</p>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded" style={{ backgroundColor: currentColors.light, color: currentColors.main }}>
                                {item.date}
                            </span>
                        </div>
                    ))}
                    {certs.length === 0 && (
                        <p className="text-xs text-gray-300 italic col-span-2 py-6 text-center">등록된 자격증이 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 공모전 */}
            <div className="pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Briefcase size={16} style={{ color: currentColors.main }} />
                        공모전 참여 기록
                    </h3>
                    <button
                        onClick={() => setShowCompForm(!showCompForm)}
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg hover:opacity-80 transition-opacity text-white"
                        style={{ backgroundColor: currentColors.main }}
                    >
                        {showCompForm ? <X size={10} /> : <Plus size={10} />}
                        {showCompForm ? '닫기' : '추가'}
                    </button>
                </div>

                {/* 공모전 추가 폼 */}
                <AnimatePresence>
                    {showCompForm && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden mb-3"
                        >
                            <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                                <input
                                    type="text" value={compForm.name} onChange={e => setCompForm({ ...compForm, name: e.target.value })}
                                    placeholder="공모전 이름" className="w-full bg-white rounded-lg px-3 py-2 text-xs font-medium outline-none border border-gray-100 focus:border-brand transition-colors"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="date" value={compForm.date} onChange={e => setCompForm({ ...compForm, date: e.target.value })}
                                        className="flex-1 bg-white rounded-lg px-3 py-2 text-xs font-medium outline-none border border-gray-100 focus:border-brand transition-colors"
                                    />
                                    <select
                                        value={compForm.status} onChange={e => setCompForm({ ...compForm, status: e.target.value })}
                                        className="bg-white rounded-lg px-3 py-2 text-xs font-medium outline-none border border-gray-100 focus:border-brand transition-colors"
                                    >
                                        <option value="진행 중">진행 중</option>
                                        <option value="완료">완료</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text" value={compForm.result === "-" ? "" : compForm.result} onChange={e => setCompForm({ ...compForm, result: e.target.value || "-" })}
                                        placeholder="결과 (예: 우수상)" className="flex-1 bg-white rounded-lg px-3 py-2 text-xs font-medium outline-none border border-gray-100 focus:border-brand transition-colors"
                                    />
                                    <button onClick={addComp} className="px-4 py-2 rounded-lg text-white text-xs font-bold hover:opacity-90 transition-opacity" style={{ backgroundColor: currentColors.main }}>
                                        등록
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-2">
                    {comps.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
                            <div>
                                <h4 className="font-bold text-sm text-gray-700">{item.name}</h4>
                                <div className="flex gap-2 mt-1">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${item.status === '완료' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'}`}>
                                        {item.status}
                                    </span>
                                    <span className="text-[10px] text-gray-300 font-medium">{item.date}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <p className="text-[9px] text-gray-300 font-bold uppercase">결과</p>
                                    <p className="font-black text-sm text-gray-700">{item.result}</p>
                                </div>
                                <button
                                    onClick={() => setComps(comps.filter((_, i) => i !== idx))}
                                    className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {comps.length === 0 && (
                        <p className="text-xs text-gray-300 italic py-6 text-center">등록된 공모전이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ==============================
   메인 컴포넌트
============================== */
export default function StudyRoomClient() {
    const { user, logout } = useAuth();
    const { currentColors } = useTheme();
    const [rightTab, setRightTab] = useState<'goals' | 'cert'>('goals');

    const [exams, setExams] = useState<{ date: string; name: string }[]>([]);

    const addExam = (exam: { date: string; name: string }) => {
        setExams([...exams, exam]);
    };

    const removeExam = (index: number) => {
        setExams(exams.filter((_, i) => i !== index));
    };

    if (!user) return null;

    return (
        <div className="bg-[#f4f6f9] min-h-screen">
            <Header user={user} onLogout={logout} />

            <div className="h-[190px] md:h-28" />

            <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-8">
                {/* ====== 모바일 전용 퀵 링크 (AI 뉴스 & Career Hub) ====== */}
                <div className="min-[1700px]:hidden space-y-8 mb-8 pb-8 border-b border-gray-100">
                    <QuickLinksHub side="left" mobile />
                    <QuickLinksHub side="right" mobile />
                </div>

                {/* 상단: 뒤로가기 + 타이틀 */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <Link
                            href="/home"
                            className="text-xs text-brand font-bold mb-3 flex items-center gap-1.5 hover:translate-x-[-3px] transition-transform w-fit"
                        >
                            ← 대시보드
                        </Link>
                        <h1 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tight leading-tight">
                            개인 공부방
                        </h1>
                    </div>
                    <p className="text-[10px] md:text-xs text-brand font-black hidden sm:block">
                        나만의 학습 공간 ⚡️
                    </p>
                </div>

                {/* ========== 와이드 2-컬럼 대시보드 ========== */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8" style={{ minHeight: 'calc(100vh - 260px)' }}>

                    {/* 좌측: 달력 (항상 표시) */}
                    <Card className="lg:col-span-5 p-6 border-none shadow-lg bg-white flex flex-col">
                        <InlineCalendar exams={exams} onAddExam={addExam} onRemoveExam={removeExam} currentColors={currentColors} />
                    </Card>

                    {/* 우측: 탭 전환 패널 */}
                    <div className="lg:col-span-7 flex flex-col">

                        {/* 우측 탭 버튼 */}
                        <div className="flex gap-1.5 bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-4 w-full sm:w-fit overflow-x-auto scrollbar-hide">
                            {[
                                { key: 'goals', label: '공부 목표', icon: ListTodo },
                                { key: 'cert', label: '자격증 / 공모전', icon: Award }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setRightTab(tab.key as any)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all flex-1 sm:flex-none whitespace-nowrap justify-center ${rightTab === tab.key ? 'shadow-md text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                                    style={rightTab === tab.key ? { backgroundColor: currentColors.main } : {}}
                                >
                                    <tab.icon size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* 우측 콘텐츠 */}
                        <Card className="flex-1 p-6 border-none shadow-lg bg-white overflow-hidden">
                            <AnimatePresence mode="wait">
                                {rightTab === 'goals' && (
                                    <motion.div
                                        key="goals"
                                        initial={{ opacity: 0, x: 15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -15 }}
                                        transition={{ duration: 0.2 }}
                                        className="h-full"
                                    >
                                        <InlineGoals currentColors={currentColors} />
                                    </motion.div>
                                )}

                                {rightTab === 'cert' && (
                                    <motion.div
                                        key="cert"
                                        initial={{ opacity: 0, x: 15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -15 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <CertCompSection currentColors={currentColors} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </div>
                </div>

                {/* ====== PC용 푸터 혹은 추가 여백 ====== */}
            </main>
        </div>
    );
}
