"use client";

import { useCallback, useState } from "react";
import { Facebook, Link as LinkIcon, Twitter } from "lucide-react";

import { Button } from "@/components/ui/button";

type ShareBarProps = {
  url: string;
  title: string;
};

export function ShareBar({ url, title }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Unable to copy page URL", error);
    }
  }, [url]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Share this guide
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <LinkIcon className="mr-2 h-4 w-4" aria-hidden />
          {copied ? "Copied!" : "Copy link"}
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          aria-label="Share on X"
        >
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter className="mr-2 h-4 w-4" aria-hidden />
            X / Twitter
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          aria-label="Share on Facebook"
        >
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Facebook className="mr-2 h-4 w-4" aria-hidden />
            Facebook
          </a>
        </Button>
      </div>
    </div>
  );
}
