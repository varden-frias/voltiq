"use client";

import { useEffect, useState } from "react";
import { demoLeads } from "@/lib/demo-data";

type Lead = {
  name: string;
  email: string;
  interest: string;
  note: string;
};

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(demoMode);
  const [leads, setLeads] = useState<Lead[]>(demoMode ? demoLeads : []);
  const [status, setStatus] = useState(demoMode ? "Demo unlocked" : "Locked");
  const [activeTab, setActiveTab] = useState<"inbox" | "settings">("inbox");

  async function loadLeads() {
    if (demoMode) {
      setLeads(demoLeads);
      setStatus("Loaded demo leads");
      return;
    }

    setStatus("Loading leads...");
    try {
      const res = await fetch("http://127.0.0.1:3001/leads", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load leads");
      const data = await res.json();
      setLeads(data.leads ?? []);
      setStatus("Loaded");
    } catch {
      setStatus("Unable to load leads");
    }
  }

  function handleUnlock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password === "voltiq-admin") {
      setUnlocked(true);
      setStatus("Unlocked");
      loadLeads();
    } else {
      setStatus("Wrong password");
    }
  }

  useEffect(() => {
    if (unlocked) loadLeads();
  }, [unlocked]);

  if (!unlocked) {
    return (
      <main className="min-h-screen px-4 py-8 md:px-10">
        <section className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md md:p-10">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-blue-200/80">
            VoltIQ Admin
          </p>
          <h1 className="text-3xl font-semibold">Enter password</h1>
          <p className="mt-3 text-sm text-white/70">
            This is a simple gate for now. Use the dashboard password to access leads.
          </p>

          <form onSubmit={handleUnlock} className="mt-6 grid gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#141DD9] px-4 py-3 text-sm font-medium text-white"
            >
              Unlock
            </button>
            {status ? <p className="text-sm text-white/70">{status}</p> : null}
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-10">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-md">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-200/80">
            VoltIQ
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Admin</h2>

          <nav className="mt-6 grid gap-2">
            <button
              onClick={() => setActiveTab("inbox")}
              className={`rounded-xl px-4 py-3 text-left text-sm ${
                activeTab === "inbox" ? "bg-white/10" : "bg-black/10"
              }`}
            >
              Lead Inbox
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`rounded-xl px-4 py-3 text-left text-sm ${
                activeTab === "settings" ? "bg-white/10" : "bg-black/10"
              }`}
            >
              Prompt Settings
            </button>
          </nav>

          <div className="mt-6 rounded-2xl bg-black/20 p-4 text-sm text-white/70">
            {status}
          </div>
        </aside>

        <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md md:p-10">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-blue-200/80">
              Admin Dashboard
            </p>
            <h1 className="text-3xl font-semibold md:text-5xl">
              Manage leads and assistant settings
            </h1>
            <p className="mt-3 text-white/70">
              A simple overview for the client to see activity and manage the bot.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Total Leads" value={String(leads.length)} />
            <StatCard
              label="Hot Leads"
              value={String(Math.max(1, Math.ceil(leads.length / 2)))}
            />
            <StatCard
              label="Status"
              value={activeTab === "inbox" ? "Inbox" : "Settings"}
            />
          </div>

          {activeTab === "inbox" ? (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/80">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Interest</th>
                    <th className="px-4 py-3">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-white/60" colSpan={4}>
                        No leads yet.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead, index) => (
                      <tr key={index} className="border-t border-white/10">
                        <td className="px-4 py-3">{lead.name}</td>
                        <td className="px-4 py-3">{lead.email}</td>
                        <td className="px-4 py-3">{lead.interest}</td>
                        <td className="px-4 py-3">{lead.note}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <h3 className="text-base font-medium">Prompt settings</h3>
                <p className="mt-2 text-sm text-white/70">
                  These are placeholder controls for the chatbot prompt and recommended product categories.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <h3 className="text-base font-medium">FAQ settings</h3>
                <p className="mt-2 text-sm text-white/70">
                  Add editable FAQ content here later so the client can update answers without code changes.
                </p>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <p className="text-sm text-white/60">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}