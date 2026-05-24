"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Gauge,
  Github,
  Kanban,
  LayoutDashboard,
  Sparkles,
  Zap,
} from "lucide-react";

const DEMO_SESSION_KEY = "planpilot_demo_session";

export default function LandingPage() {
  const router = useRouter();
  const [entering, setEntering] = useState(false);

  // If already has a session, go straight to the app
  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = sessionStorage.getItem(DEMO_SESSION_KEY);
      if (session) {
        router.replace("/home");
      }
    }
  }, [router]);

  const handleEnterDemo = () => {
    setEntering(true);
    sessionStorage.setItem(DEMO_SESSION_KEY, "true");
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight">PlanPilot AI</span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-16 text-center sm:px-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-800 bg-emerald-950 px-4 py-1.5 text-sm font-semibold text-emerald-400">
          <Zap className="h-3.5 w-3.5" />
          No AWS · No paid AI · Free to deploy
        </div>

        <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          The AI-powered project
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            delivery dashboard
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          Manage projects and tasks across Kanban, List, Table, and Timeline
          views. Generate sprint plans with AI risk scoring. No cloud setup
          required — works entirely in demo mode.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={handleEnterDemo}
            disabled={entering}
            className="flex items-center gap-2 rounded-md bg-emerald-500 px-6 py-3 text-base font-bold text-white transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {entering ? "Loading…" : "Enter Demo"}
            {!entering && <ArrowRight className="h-4 w-4" />}
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md border border-slate-700 px-6 py-3 text-base font-bold text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            View Source
          </a>
        </div>

        <p className="mt-4 text-xs text-slate-600">
          Demo runs with seeded in-memory data · No sign-up needed · Instant access
        </p>
      </section>

      {/* WORKFLOW STEPS */}
      <section className="border-y border-slate-800 bg-slate-900/50 px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="mb-10 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
            How it works
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                icon: LayoutDashboard,
                title: "Enter Demo",
                desc: "One click — no sign-up, no AWS, no database needed. Seeded projects load instantly.",
              },
              {
                step: "2",
                icon: Kanban,
                title: "Explore Projects",
                desc: "Switch between Kanban, List, Table, and Timeline views. Create and drag tasks.",
              },
              {
                step: "3",
                icon: Bot,
                title: "Generate a Sprint",
                desc: "Open AI Copilot. Describe your goal and get a full sprint plan with risk scores in seconds.",
              },
              {
                step: "4",
                icon: CheckCircle2,
                title: "Create Board Tasks",
                desc: "Push AI-generated tasks directly to your project board. Review, assign, and ship.",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="rounded-md border border-slate-800 bg-slate-900 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-sm font-black text-slate-400">
                    {step}
                  </div>
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="mb-2 text-sm font-black text-white">{title}</h3>
                <p className="text-xs leading-5 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        <p className="mb-10 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
          What&apos;s inside
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Gauge, label: "Health score & risk signals", color: "text-rose-400" },
            { icon: Bot, label: "AI Sprint Copilot (no paid API)", color: "text-emerald-400" },
            { icon: Kanban, label: "Kanban drag-and-drop board", color: "text-blue-400" },
            { icon: CheckCircle2, label: "List, Table & Timeline views", color: "text-cyan-400" },
            { icon: Sparkles, label: "Story point estimates & phases", color: "text-violet-400" },
            { icon: Zap, label: "Demo mode — zero setup", color: "text-amber-400" },
          ].map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-900 px-4 py-3"
            >
              <Icon className={`h-5 w-5 flex-none ${color}`} />
              <span className="text-sm text-slate-300">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={handleEnterDemo}
            disabled={entering}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-8 py-3 text-base font-bold text-white transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {entering ? "Loading…" : "Start the Demo"}
            {!entering && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 px-6 py-8 text-center text-xs text-slate-600 sm:px-10">
        PlanPilot AI · Built with Next.js, Express, Prisma, Redux Toolkit, Tailwind CSS
        · Free to deploy on Vercel + Render
      </footer>
    </div>
  );
}
