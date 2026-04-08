"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToastStore } from "@/store/toast-store";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToastStore();

  const onSubmit = () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please complete all contact fields.");
      setSubmitted(false);
      addToast({
        title: "Message not sent",
        description: "Please complete all contact fields.",
        variant: "error",
      });
      return;
    }

    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      setSubmitted(false);
      addToast({
        title: "Message not sent",
        description: "Please enter a valid email address.",
        variant: "error",
      });
      return;
    }

    setError("");
    setSubmitted(true);
    addToast({
      title: "Message sent",
      description: "We will follow up at the email address you provided.",
      variant: "success",
    });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="grid gap-8 pb-10 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
          Contact
        </p>
        <h1 className="mt-4 font-display text-5xl leading-none text-stone-950">
          Reach the team
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          Includes a validated contact form and an embedded map for location context.
        </p>

        <div className="mt-8 space-y-4">
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Your name"
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none"
          />
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Your email"
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none"
          />
          <textarea
            value={form.message}
            onChange={(event) =>
              setForm((current) => ({ ...current, message: event.target.value }))
            }
            placeholder="How can we help?"
            rows={6}
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none"
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {submitted ? (
            <p className="text-sm text-emerald-700">
              Message sent. We will follow up at the email address you provided.
            </p>
          ) : null}
          <Button onClick={onSubmit} className="rounded-full bg-stone-950 hover:bg-stone-800">
            Send message
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-100">
        <iframe
          title="Google Map"
          src="https://www.google.com/maps?q=Ho%20Chi%20Minh%20City&output=embed"
          className="h-full min-h-[520px] w-full"
          loading="lazy"
        />
      </section>
    </div>
  );
}
