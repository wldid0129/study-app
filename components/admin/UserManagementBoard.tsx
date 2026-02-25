"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useMemo } from "react";

interface Props {
    users: any[];
    toggleVisibility: (userId: string, isHidden: boolean) => void;
}

export default function UserManagementBoard({ users, toggleVisibility }: Props) {
    // 💡 제외된 회원을 아래로 내림 (isHidden: true 가 마지막으로 가도록 정렬)
    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => {
            if (a.isHidden === b.isHidden) return 0;
            return a.isHidden ? 1 : -1;
        });
    }, [users]);

    return (
        <Card className="p-10 mb-12">
            <h2 className="text-xl font-bold mb-6">👤 회원 관리</h2>
            <div className="text-sm text-gray-500 mb-6">
                현황판 및 랭킹에서 제외할 회원을 설정할 수 있습니다. (제외된 회원은 목록 하단에 표시됩니다)
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b text-gray-400 text-xs uppercase tracking-widest">
                            <th className="pb-4 font-bold">이름 (이메일)</th>
                            <th className="pb-4 font-bold text-center">권한</th>
                            <th className="pb-4 font-bold text-center">상태</th>
                            <th className="pb-4 font-bold text-right">작업</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sortedUsers.map((user) => (
                            <tr key={user.id} className={`hover:bg-gray-50/50 transition ${user.isHidden ? 'bg-gray-50/30' : ''}`}>
                                <td className="py-5">
                                    <div className={`font-bold ${user.isHidden ? 'text-gray-400' : 'text-gray-900'}`}>{user.name || "Unknown"}</div>
                                    <div className="text-[11px] text-gray-400">{user.email}</div>
                                </td>
                                <td className="py-5 text-center">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${user.role === "admin" ? "bg-purple-50 text-purple-600 border border-purple-100" :
                                        user.role === "user" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                            "bg-gray-100 text-gray-500"
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-5 text-center">
                                    {user.isHidden ? (
                                        <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-md">제외됨</span>
                                    ) : (
                                        <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-md">활성</span>
                                    )}
                                </td>
                                <td className="py-5 text-right">
                                    <Button
                                        variant={user.isHidden ? "primary" : "secondary"}
                                        className={`text-[11px] font-bold px-4 py-1.5 rounded-xl shadow-sm transition-all ${user.isHidden ? 'bg-indigo-600 hover:bg-indigo-700' : ''
                                            }`}
                                        onClick={() => toggleVisibility(user.id, !user.isHidden)}
                                    >
                                        {user.isHidden ? "복구하기" : "목록에서 제외"}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
