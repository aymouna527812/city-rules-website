
"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopySnippetProps = {
  label: string;
  content: string;
  className?: string;
};

export function CopySnippet({ label, content, className }: CopySnippetProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy text", error);
    }
  }

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-emerald-600" aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" aria-hidden />
              Copy
            </>
          )}
        </Button>
      </div>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{content}</p>
    </div>
  );
}
