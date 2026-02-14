"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";

export default function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <Card className="flex justify-between items-center p-8 mb-10">

      <div className="text-xl font-bold">
        관리자 페이지
      </div>

      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-gray-200 rounded-lg"
      >
        로그아웃
      </button>

    </Card>
  );
}
