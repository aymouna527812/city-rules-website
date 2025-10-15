export type TimeFormatMode = "24h" | "12h";

function to12h(hour: number, minute: number): string {
  const suffix = hour >= 12 ? "pm" : "am";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const mm = String(minute).padStart(2, "0");
  return `${h}:${mm} ${suffix}`;
}

/**
 * Replace all 24-hour HH:mm time tokens in the input string with
 * 12-hour formatted tokens when mode === "12h". Leaves other text intact.
 */
export function formatTimesInText(text: string, mode: TimeFormatMode): string {
  if (mode !== "12h") return text;
  // Match 0–23 hours with optional leading zero, and minutes 00–59
  const timeRe = /\b(?<h>(?:[01]?\d|2[0-3])):(?<m>[0-5]\d)\b/g;
  return text.replace(timeRe, (_match, _h, _m, _off, _s, groups?: { h: string; m: string }) => {
    const hh = groups?.h ?? _h;
    const mm = groups?.m ?? _m;
    const hour = Number(hh);
    const minute = Number(mm);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return _match;
    return to12h(hour, minute);
  });
}

