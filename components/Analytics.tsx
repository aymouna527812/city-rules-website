"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function isTrackingAllowed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const win = window as Window & { doNotTrack?: string };
  const nav = navigator as Navigator & { doNotTrack?: string; msDoNotTrack?: string };
  const dnt = win.doNotTrack ?? nav.doNotTrack ?? nav.msDoNotTrack;
  return dnt !== "1" && dnt !== "yes";
}

export function Analytics() {
  useEffect(() => {
    if (!GA_ID || !isTrackingAllowed()) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    const inlineScript = document.createElement("script");
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}', { anonymize_ip: true });
    `;
    document.head.appendChild(inlineScript);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(inlineScript);
    };
  }, []);

  return null;
}

// Separate route-change tracker to allow wrapping with Suspense in the layout
export function RouteAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || typeof window === "undefined") return;
    const query = searchParams?.toString();
    const url = pathname + (query ? `?${query}` : "");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gtag?.("config", GA_ID, { page_path: url });
  }, [pathname, searchParams]);

  return null;
}
