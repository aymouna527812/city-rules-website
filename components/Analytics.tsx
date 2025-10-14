
"use client";

import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function isTrackingAllowed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const dnt = window.doNotTrack ?? navigator.doNotTrack ?? (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack;
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
