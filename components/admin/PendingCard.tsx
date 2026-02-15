interface Props {
  item: any;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function PendingCard({
  item,
  onApprove,
  onReject,
}: Props) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition">

      {/* 날짜 */}
      <div className="text-xs text-gray-500 mb-2">
        {item.date}
      </div>

      {/* 🔥 총 문제 개수 추가 */}
      <div className="text-sm font-medium text-indigo-600 mb-3">
        총 문제 개수: {item.problemCount ?? 0}
      </div>

      {/* 이미지 */}
      <img
        src={item.imageUrl}
        className="w-full h-40 object-cover rounded-lg mb-4"
      />

      {/* 버튼 */}
      <div className="flex justify-between gap-3">

        <button
          onClick={() => onApprove(item.id)}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
        >
          승인
        </button>

        <button
          onClick={() => onReject(item.id)}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
        >
          거절
        </button>

      </div>
    </div>
  );
}

