import { DAILY_REQUEST_LIMIT } from "./config";

const STORAGE_KEY = "resumeos_rate_log";

interface RateLog {
  [date: string]: number;  // "Mon May 29 2026" → count
}

export function checkAndIncrementRate(): void {
  const today = new Date().toDateString();
  const log: RateLog = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  const todayCount = log[today] ?? 0;

  if (todayCount >= DAILY_REQUEST_LIMIT) {
    throw new Error(`Daily limit of ${DAILY_REQUEST_LIMIT} generations reached. Try again tomorrow.`);
  }

  log[today] = todayCount + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

export function getTodayCount(): number {
  const today = new Date().toDateString();
  const log: RateLog = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  return log[today] ?? 0;
}
