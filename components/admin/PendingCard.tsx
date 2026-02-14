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
    <div className="bg-gray-50 p-6 rounded-xl">

      <div className="text-xs text-gray-500 mb-2">
        {item.date}
      </div>

      <img
        src={item.imageUrl}
        className="w-full h-40 object-cover rounded-lg mb-4"
      />

      <div className="flex justify-between">

        <button
          onClick={() => onApprove(item.id)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm"
        >
          승인
        </button>

        <button
          onClick={() => onReject(item.id)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
        >
          거절
        </button>

      </div>

    </div>
  );
}
