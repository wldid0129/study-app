import { User } from "firebase/auth";

interface HeaderProps {
  user: any;
  onLogout: () => void;
}

export default function Header({
  user,
  onLogout,
}: HeaderProps) {

  return (
    <div className="bg-white shadow-md border border-gray-100 rounded-2xl px-10 py-6 flex justify-between items-center mb-8">

      <div className="font-bold text-lg">
        AIOT
      </div>

      <div className="font-bold text-xl">
        CodePool-i Study
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user?.email}
        </span>

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm font-medium"
        >
          로그아웃
        </button>
      </div>

    </div>
  );
}
