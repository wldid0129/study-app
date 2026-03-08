"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { CheckCircle2, Circle, Plus, ListTodo } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface Todo {
    id: number;
    text: string;
    done: boolean;
}

export default function StudyGoals() {
    const { currentColors } = useTheme();
    const [todos, setTodos] = useState<Todo[]>([
        { id: 1, text: "자격증 이론 3강 수강", done: true },
        { id: 2, text: "공모전 기획서 초안 작성", done: false },
    ]);
    const [input, setInput] = useState("");

    const toggleTodo = (id: number) => {
        setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const addTodo = () => {
        if (!input.trim()) return;
        setTodos([...todos, { id: Date.now(), text: input, done: false }]);
        setInput("");
    };

    return (
        <Card className="p-6 border-none shadow-md bg-white">
            <div className="flex items-center gap-2 mb-6">
                <ListTodo size={20} style={{ color: currentColors.main }} />
                <h3 className="font-black text-xl text-gray-800 tracking-tight">오늘의 공부 목표</h3>
            </div>

            <div className="space-y-3 mb-6">
                {todos.map(todo => (
                    <div
                        key={todo.id}
                        onClick={() => toggleTodo(todo.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border ${todo.done ? 'bg-gray-50 border-transparent opacity-60' : 'bg-white border-gray-50 hover:border-gray-100 shadow-sm'}`}
                    >
                        {todo.done ? (
                            <CheckCircle2 size={20} style={{ color: currentColors.main }} />
                        ) : (
                            <Circle size={20} className="text-gray-200" />
                        )}
                        <span className={`text-sm font-bold ${todo.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {todo.text}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="새로운 목표를 입력하세요..."
                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand/20 transition-all outline-none"
                />
                <button
                    onClick={addTodo}
                    className="p-3.5 rounded-xl text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
                    style={{ backgroundColor: currentColors.main }}
                >
                    <Plus size={20} />
                </button>
            </div>
        </Card>
    );
}
