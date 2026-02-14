export function calculateStreak(dates: string[]) {
  const today = new Date();
  let count = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];

    if (dates.includes(key)) count++;
    else break;
  }

  return count;
}
