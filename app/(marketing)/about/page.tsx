
import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About Quiet Hours & Noise Rules",
  description:
    "Learn how we verify municipal noise bylaws, collect data, and keep every quiet hour page current.",
};

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Editorial policy</p>
        <h1 className="text-4xl font-bold text-slate-900">Built for evidence-based noise guidance</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Quiet Hours &amp; Noise Rules distils the parts of municipal bylaws that residents lean on
          most—quiet hours, construction schedules, decibel thresholds, and how to escalate politely. We
          double-check every data point before it goes live.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Primary sources first</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            We cite the latest consolidated version of each city’s noise bylaw or administrative code.
            When a municipality issues an amendment, we review and update the summary within seven
            business days.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quarterly verification</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Each city page is revisited at least once per quarter. We log the verification date, cross
            check quiet hour windows, and run every enforcement link to confirm it still resolves.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community feedback</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Residents, landlords, and property managers can flag changes using the “Suggest an update”
            link on each page. We investigate, confirm with city staff, and respond with an ETA for the
            update.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accessibility commitment</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Our goal is WCAG 2.2 AA compliance—structured headings, keyboard-friendly interactions, and
            colour contrast that works in daylight and dark apartments alike.
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Coverage roadmap</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Phase 1: 100+ Canadian and US cities with population over 200,000.</li>
          <li>Phase 2: Suburban hubs and fast-growing commuter regions.</li>
          <li>Phase 3: Expanded coverage for EU noise directives and APAC mega-cities.</li>
        </ul>
      </section>
    </div>
  );
}
