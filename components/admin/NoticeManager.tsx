import Card from "@/components/ui/Card";

interface Props {
  noticeContent: string;
  setNoticeContent: (v: string) => void;
  onSave: () => void;
}

export default function NoticeManager({
  noticeContent,
  setNoticeContent,
  onSave,
}: Props) {
  return (
    <Card className="p-10 mb-12">

      <div className="text-sm text-gray-500 mb-6">
        NOTICE MANAGEMENT
      </div>

      <textarea
        value={noticeContent}
        onChange={(e) => setNoticeContent(e.target.value)}
        className="w-full min-h-[120px] p-4 border rounded-lg mb-6"
      />

      <button
        onClick={onSave}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
      >
        저장
      </button>

    </Card>
  );
}
