export type GoalType = "daily" | "weekly";

export interface Goal {
  id: string;
  type: GoalType;
  content: string;
  targetCount: number;
  startDate: string;
  endDate: string;
  createdAt: any;
}
