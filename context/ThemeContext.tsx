"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeColor = {
    name: string;
    main: string;
    hover: string;
    light: string;
    shades?: Record<number, string>;
};

const presets: Record<string, ThemeColor> = {
    indigo: { name: "보라 (기본)", main: "#4f46e5", hover: "#4338ca", light: "#e0e7ff" },
    orange: { name: "오렌지", main: "#f97316", hover: "#ea580c", light: "#ffedd5" },
    blue: { name: "블루", main: "#3b82f6", hover: "#2563eb", light: "#dbeafe" },
    teal: { name: "민트", main: "#0fb9b1", hover: "#099b94", light: "#e6fcfb" },
    green: { name: "그린", main: "#22c55e", hover: "#16a34a", light: "#dcfce7" },
    black: { name: "블랙", main: "#171717", hover: "#000000", light: "#f5f5f5" },
};

interface ThemeContextType {
    theme: string;
    customColor: string | null;
    setTheme: (name: string) => void;
    setCustomColor: (color: string) => void;
    currentColors: ThemeColor;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState("indigo");
    const [customColor, setCustomColorState] = useState<string | null>(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem("app-theme") || "indigo";
        const savedCustom = localStorage.getItem("app-custom-color");
        setThemeState(savedTheme);
        if (savedCustom) setCustomColorState(savedCustom);
    }, []);

    const setTheme = (name: string) => {
        setThemeState(name);
        setCustomColorState(null);
        localStorage.setItem("app-theme", name);
        localStorage.removeItem("app-custom-color");
    };

    const setCustomColor = (color: string) => {
        setCustomColorState(color);
        localStorage.setItem("app-custom-color", color);
    };

    const getHexAlpha = (hex: string, alpha: number) => {
        const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
        return `${hex}${a}`;
    };

    const currentColors = customColor
        ? {
            name: "사용자 지정",
            main: customColor,
            hover: customColor,
            light: getHexAlpha(customColor, 0.1),
            shades: {
                10: getHexAlpha(customColor, 0.1),
                20: getHexAlpha(customColor, 0.25),
                40: getHexAlpha(customColor, 0.45),
                60: getHexAlpha(customColor, 0.65),
                80: getHexAlpha(customColor, 0.85),
            }
        }
        : {
            ...presets[theme] || presets.indigo,
            shades: {
                10: getHexAlpha((presets[theme] || presets.indigo).main, 0.1),
                20: getHexAlpha((presets[theme] || presets.indigo).main, 0.25),
                40: getHexAlpha((presets[theme] || presets.indigo).main, 0.45),
                60: getHexAlpha((presets[theme] || presets.indigo).main, 0.65),
                80: getHexAlpha((presets[theme] || presets.indigo).main, 0.85),
            }
        };

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--brand-color", currentColors.main);
        root.style.setProperty("--brand-hover", currentColors.hover);
        root.style.setProperty("--brand-light", currentColors.light);

        // 디버깅용 (브라우저 콘솔에서 확인 가능)
        console.log("Theme updated:", currentColors.main);
    }, [currentColors]);

    return (
        <ThemeContext.Provider value={{ theme, customColor, setTheme, setCustomColor, currentColors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within ThemeProvider");
    return context;
}
