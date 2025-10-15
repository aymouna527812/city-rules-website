"use client";

import { useTimeFormat } from "@/components/TimeFormatProvider";
import { formatTimesInText } from "@/lib/timeFormat";

export function TimeText({ value }: { value: string }) {
  const { mode } = useTimeFormat();
  const formatted = formatTimesInText(value, mode);
  return <>{formatted}</>;
}

