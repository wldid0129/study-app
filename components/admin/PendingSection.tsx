import Card from "@/components/ui/Card";
import PendingCard from "./PendingCard";

interface Props {
  list: any[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function PendingSection({
  list,
  onApprove,
  onReject,
}: Props) {

  return (
    <Card className="p-10">

      <div className="text-sm text-gray-500 mb-8">
        PENDING APPROVAL
      </div>

      {list.length === 0 && (
        <div className="text-sm text-gray-400">
          대기 중인 출석 없음
        </div>
      )}

      <div className="grid grid-cols-3 gap-8">
        {list.map((item) => (
          <PendingCard
            key={item.id}
            item={item}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </div>

    </Card>
  );
}
