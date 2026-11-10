const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

// "3 nov 2026 · 05:07" (hora local del dispositivo). Sin Intl para no depender del motor JS.
export function formatLogDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const month = MONTHS[date.getMonth()] ?? "";
  return `${date.getDate()} ${month} ${date.getFullYear()} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
