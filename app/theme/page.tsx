"use client";

import { useTheme } from "@/context/ThemeContext";
import Card from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Check, Palette, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const presets = [
    { id: "indigo", name: "보라 (기본)", color: "#4f46e5" },
    { id: "orange", name: "오렌지", color: "#f97316" },
    { id: "blue", name: "블루", color: "#3b82f6" },
    { id: "teal", name: "민트", color: "#0fb9b1" },
    { id: "green", name: "그린", color: "#22c55e" },
    { id: "black", name: "블랙", color: "#171717" },
];

export default function ThemePage() {
    const { theme, setTheme, setCustomColor, customColor } = useTheme();

    // 로컬 상태 (저장 버튼을 누르기 전까지는 실제 컨텍스트에 반영하지 않음)
    const [selectedTheme, setSelectedTheme] = useState(theme);
    const [selectedCustomColor, setSelectedCustomColor] = useState(customColor);
    const [tempColor, setTempColor] = useState(customColor || "#4f46e5");

    const handleSave = () => {
        if (selectedCustomColor) {
            setCustomColor(selectedCustomColor);
        } else {
            setTheme(selectedTheme);
        }
        alert("테마가 저장되었습니다!");
    };

    // 실시간 미리보기를 위한 현재 선택된 색상 계산
    const getPreviewColors = () => {
        if (selectedCustomColor) {
            return {
                main: selectedCustomColor,
                light: `${selectedCustomColor}15`,
                shade60: `${selectedCustomColor}99`
            };
        }
        const preset = presets.find(p => p.id === selectedTheme) || presets[0];
        return {
            main: preset.color,
            light: `${preset.color}15`,
            shade60: `${preset.color}99`
        };
    };

    const preview = getPreviewColors();

    return (
        <div className="bg-[#f8fafc] min-h-screen p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <Link
                        href="/home"
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand transition group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        대시보드로 돌아가기
                    </Link>

                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-black shadow-2xl hover:scale-105 transition-all active:scale-95 group relative overflow-hidden"
                        style={{
                            backgroundColor: preview.main,
                            boxShadow: `0 20px 25px -5px ${preview.main}40`
                        }}
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Save size={20} className="group-hover:rotate-12 transition-transform relative z-10" />
                        <span className="relative z-10 tracking-tight">테마 저장하기</span>
                    </button>
                </div>

                <div className="mb-12 text-center">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-3 tracking-tight">
                        학습 공간 테마 설정
                    </h1>
                    <p className="text-gray-400 font-medium italic">"원하는 컬러를 선택하고 상단의 저장 버튼을 눌러주세요."</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* 미리보기 카드 */}
                    <div className="md:col-span-1 sticky top-12">
                        <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">미리보기 (선택 중)</div>
                        <Card className="p-6 overflow-hidden border-none shadow-2xl bg-white">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg"
                                        style={{ backgroundColor: preview.main }}
                                    ></div>
                                    <div className="h-4 w-24 bg-gray-100 rounded"></div>
                                </div>
                                <div
                                    className="p-4 rounded-xl border"
                                    style={{ backgroundColor: preview.light, borderColor: `${preview.main}30` }}
                                >
                                    <div
                                        className="h-2 w-full rounded mb-2"
                                        style={{ backgroundColor: preview.shade60 }}
                                    ></div>
                                    <div
                                        className="h-2 w-2/3 rounded"
                                        style={{ backgroundColor: preview.light }}
                                    ></div>
                                </div>
                                <button
                                    className="w-full py-3 rounded-xl text-white text-xs font-bold shadow-lg"
                                    style={{ backgroundColor: preview.main, boxShadow: `0 10px 15px -3px ${preview.main}40` }}
                                >
                                    테스트 버튼
                                </button>
                            </div>
                        </Card>
                    </div>

                    {/* 테마 선택 섹션 */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">컬러 프리셋</div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {presets.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            setSelectedTheme(p.id);
                                            setSelectedCustomColor(null);
                                        }}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group ${selectedTheme === p.id && !selectedCustomColor
                                            ? "border-brand bg-white shadow-lg shadow-brand/10"
                                            : "border-gray-50 bg-gray-50/50 hover:border-gray-200 hover:bg-white"
                                            }`}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full shadow-inner relative z-10"
                                            style={{ backgroundColor: p.color }}
                                        >
                                            {selectedTheme === p.id && !selectedCustomColor && (
                                                <div className="absolute inset-0 flex items-center justify-center text-white">
                                                    <Check size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-xs font-bold ${selectedTheme === p.id && !selectedCustomColor ? "text-gray-800" : "text-gray-500"}`}>
                                            {p.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">사용자 지정 컬러</div>
                            <Card className="p-6 border-none shadow-lg bg-white relative overflow-hidden">
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="relative">
                                        <input
                                            type="color"
                                            value={tempColor}
                                            onChange={(e) => {
                                                const color = e.target.value;
                                                setTempColor(color);
                                                setSelectedCustomColor(color);
                                                setSelectedTheme("");
                                            }}
                                            className="w-16 h-16 rounded-2xl border-none cursor-pointer p-0 overflow-hidden bg-transparent"
                                        />
                                        <Palette className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-white/50" />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-gray-800 mb-1">원하는 색상을 선택하세요</h5>
                                        <p className="text-xs text-brand font-black uppercase font-mono">
                                            {tempColor}
                                        </p>
                                    </div>
                                    {selectedCustomColor && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="p-2 bg-green-50 text-green-500 rounded-full">
                                            <Check size={20} />
                                        </motion.div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        <div className="p-6 bg-brand-light/20 rounded-2xl border border-brand-light/50 flex gap-4">
                            <div className="p-2 bg-white rounded-lg text-brand self-start shadow-sm">
                                <Palette size={20} />
                            </div>
                            <div>
                                <h6 className="text-sm font-bold text-gray-800 mb-1">테마 컬러 가이드</h6>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    선택한 브랜드 컬러는 버튼, 강조 텍스트, 아이콘 배경 등 서비스 전반의 주요 요소에 자동으로 적용됩니다. 테마 저장 시 대시보드와 프로필의 모든 주요 컬러가 즉시 변경됩니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
