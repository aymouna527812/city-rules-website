import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Contact Quiet Hours & Noise Rules",
  description:
    "Reach the Quiet Hours team with update requests, partnership ideas, or questions about municipal noise data.",
};

export default function ContactPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">We’re here to help</p>
        <h1 className="text-4xl font-bold text-slate-900">Contact Quiet Hours &amp; Noise Rules</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Use the form below or email us directly at{" "}
          <Link className="font-medium text-primary hover:underline" href="mailto:hello@quiet-hours.app">
            hello@quiet-hours.app
          </Link>
          . We aim to respond within two business days.
        </p>
      </header>

      <form className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-describedby="form-help">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="name">
            Name
          </label>
          <Input id="name" name="name" placeholder="Your name" required />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="city">
            City or region (optional)
          </label>
          <Input id="city" name="city" placeholder="e.g., Toronto, Ontario" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="message">
            Message
          </label>
          <Textarea
            id="message"
            name="message"
            placeholder="Share details about a bylaw change, enforcement experience, or partnership idea."
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <p id="form-help" className="text-xs text-slate-500">
            This demo form doesn’t send emails yet. Connect it to your preferred ESP or serverless
            function, then remove this notice.
          </p>
          <Button type="submit" disabled title="Connect this form to your backend to enable submissions">
            Send message
          </Button>
        </div>
      </form>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        <h2 className="text-lg font-semibold text-slate-900">Other ways to reach us</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Data corrections:{" "}
            <Link className="text-primary hover:underline" href="mailto:updates@quiet-hours.app">
              updates@quiet-hours.app
            </Link>
          </li>
          <li>
            Press and partnerships:{" "}
            <Link className="text-primary hover:underline" href="mailto:press@quiet-hours.app">
              press@quiet-hours.app
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
