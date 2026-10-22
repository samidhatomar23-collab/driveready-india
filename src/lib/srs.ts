// Simple Leitner boxes. Box index -> days until next review.
const DAYS = [0, 1, 3, 7, 14];
const DAY = 86_400_000;

export function nextSrs(prev: { box: number; wrong: number } | undefined, correct: boolean, now = Date.now()) {
  const box = correct ? Math.min((prev?.box ?? 0) + 1, DAYS.length - 1) : 0;
  const wrong = (prev?.wrong ?? 0) + (correct ? 0 : 1);
  const due = now + (correct ? DAYS[box] * DAY : 10 * 60_000);
  return { box, due, wrong };
}
