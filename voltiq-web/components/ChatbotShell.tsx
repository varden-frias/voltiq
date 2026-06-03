"use client";

import Link from "next/link";
import { useState } from "react";
import { getDemoReply } from "@/lib/recommend";

type Message = {
  role: "assistant" | "user";
  text: string;
};

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function ChatbotShell() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi, I’m VoltIQ. I can help you compare electronics, explain specs, and recommend the best product for your needs.",
    },
    {
      role: "assistant",
      text: "Try asking: 'Best wireless headphones under $200' or 'Compare MacBook Air and Dell XPS.'",
    },
  ]);

  const [lead, setLead] = useState({
    name: "",
    email: "",
    interest: "",
    note: "",
  });
  const [leadStatus, setLeadStatus] = useState("");

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      if (demoMode) {
        const reply = getDemoReply(trimmed);
        setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      } else {
        const res = await fetch("http://127.0.0.1:3001/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.reply ?? "No reply received." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry — I couldn’t reach the backend." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLeadSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLeadStatus("Submitting...");

    try {
      if (demoMode) {
        setLead({
          name: "",
          email: "",
          interest: "",
          note: "",
        });
        setLeadStatus("Thanks — we’ll be in touch soon.");
        return;
      }

      const res = await fetch("http://127.0.0.1:3001/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });

      if (!res.ok) throw new Error("Lead submit failed");

      setLead({
        name: "",
        email: "",
        interest: "",
        note: "",
      });
      setLeadStatus("Thanks — we’ll be in touch soon.");
    } catch {
      setLeadStatus("Sorry — something went wrong.");
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-10">
      <section className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md md:p-10">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-blue-200/80">
              VoltIQ
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              An AI electronics assistant built to sell with confidence.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/70 md:text-lg">
              Help shoppers compare products, get answers, and move toward the
              right purchase with a premium conversational experience.
            </p>

            <div className="mt-6 flex gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Open Admin
              </Link>
              <span className="inline-flex items-center rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60">
                {demoMode ? "Demo mode" : "Live mode"}
              </span>
            </div>
          </div>

          <div className="grid gap-3 md:w-80">
            <div className="rounded-2xl bg-blue-500/15 p-4">
              <p className="text-sm text-blue-100">Smart recommendations</p>
            </div>
            <div className="rounded-2xl bg-blue-500/15 p-4">
              <p className="text-sm text-blue-100">Product comparisons</p>
            </div>
            <div className="rounded-2xl bg-blue-500/15 p-4">
              <p className="text-sm text-blue-100">Lead capture</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-[#050a2d]/80 p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Product Assistant</h2>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                {loading ? "Thinking..." : "Online"}
              </span>
            </div>

            <div className="flex h-[520px] flex-col justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="space-y-4 overflow-y-auto pr-1">
                {messages.map((message, index) => (
                  <Message key={index} role={message.role} text={message.text} />
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="mt-4 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                <input
                  id="chat-input"
                  name="chatMessage"
                  className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-white/40"
                  placeholder="Ask about headphones, laptops, cameras..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#141DD9] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </section>

          <aside className="space-y-6">
            <InfoCard
              title="Best fit logic"
              text="Matches products to use case, budget, and feature priorities."
            />
            <InfoCard
              title="Upsell engine"
              text="Recommends accessories and bundles when they improve the experience."
            />
            <InfoCard
              title="Admin ready"
              text="Store owners can edit products, FAQs, and featured recommendations."
            />

            <section className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6">
              <h2 className="text-lg font-medium">Lead Capture</h2>
              <p className="mt-2 text-sm text-white/70">
                Leave your details and we’ll follow up with recommendations or a quote.
              </p>

              <form onSubmit={handleLeadSubmit} className="mt-4 grid gap-3">
                <input
                  id="lead-name"
                  name="name"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none"
                  placeholder="Name"
                  value={lead.name}
                  onChange={(e) => setLead({ ...lead, name: e.target.value })}
                />

                <input
                  id="lead-email"
                  name="email"
                  type="email"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none"
                  placeholder="Email"
                  value={lead.email}
                  onChange={(e) => setLead({ ...lead, email: e.target.value })}
                />

                <input
                  id="lead-interest"
                  name="interest"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none"
                  placeholder="What are you shopping for?"
                  value={lead.interest}
                  onChange={(e) => setLead({ ...lead, interest: e.target.value })}
                />

                <textarea
                  id="lead-note"
                  name="note"
                  className="min-h-24 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none"
                  placeholder="Optional note"
                  value={lead.note}
                  onChange={(e) => setLead({ ...lead, note: e.target.value })}
                />

                <button
                  type="submit"
                  className="rounded-xl bg-[#141DD9] px-4 py-3 text-sm font-medium text-white"
                >
                  Submit Lead
                </button>

                {leadStatus ? <p className="text-sm text-white/70">{leadStatus}</p> : null}
              </form>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Message({ role, text }: { role: "assistant" | "user"; text: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? "bg-[#141DD9] text-white" : "bg-white/10 text-white/90"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-base font-medium">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{text}</p>
    </div>
  );
}