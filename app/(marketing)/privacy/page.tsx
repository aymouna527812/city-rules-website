import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How City Rules collects, uses, and protects information, including cookies and analytics details.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Privacy</p>
        <h1 className="text-4xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Your privacy matters. This page describes what we collect, how we use it, and the
          choices you have. The short version: we collect the minimum necessary to operate the
          site, improve content quality, and keep things secure.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Information we collect</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-300">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Basic usage data: pages visited, approximate region (derived from IP), referring
                site, and timestamps.
              </li>
              <li>
                Device and browser metadata: screen size, OS and browser version, and language
                settings.
              </li>
              <li>
                Feedback you choose to send (for example, update suggestions on city pages or via
                our contact form).
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies and local storage</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-300">
            We use strictly necessary cookies and local storage to keep your theme preferences
            and improve navigation. We do not use cookies to sell personal information.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-300">
            We use privacy-minded analytics to understand which pages are most helpful and to
            spot broken links. Analytics are aggregated and not used to identify individual
            users. IP addresses may be briefly processed for security and geolocation and then
            discarded or anonymized per provider defaults.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How we use information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-300">
            <ul className="list-disc space-y-1 pl-5">
              <li>Operate, maintain, and secure the website.</li>
              <li>Improve content accuracy and page performance.</li>
              <li>Respond to your messages and support requests.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data retention</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-300">
            We keep logs and analytics data only as long as necessary for operations, security,
            and trend analysis. Feedback and email messages are retained as long as needed to
            respond and maintain a record of changes.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your choices and rights</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-300">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Opt out of non-essential cookies via your browser settings or content blockers.
              </li>
              <li>
                Request access or deletion of feedback you submitted by contacting us (include the
                relevant page URL and approximate date).
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Third parties</h2>
        <p>
          We may link to third-party websites (for example, city bylaws or schedule tools). Those
          sites have their own privacy policies. We are not responsible for their content or data
          practices.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Contact</h2>
        <p>
          Questions or requests? Visit our <a className="underline" href="/contact">Contact</a>
          {" "}page. We aim to reply within 3 business days.
        </p>
      </section>

      <p className="text-xs text-slate-500">
        Last updated: {new Date().toISOString().slice(0, 10)}
      </p>
    </div>
  );
}

