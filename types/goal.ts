export type GoalType = "daily" | "weekly";

export interface Goal {
  id: string;
  type: GoalType;
  content: string;
  targetCount: number;
  startDate?: string;
  endDate?: string;
  createdAt: any;
  active: boolean;
}

/* 🔥 화면 표시용 타입 추가 */
export interface DisplayGoal {
  content: string;
  targetCount: number;
}
