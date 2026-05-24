"use client";

import Header from "@/components/Header";
import {
  PlannedTask,
  Priority,
  Status,
  useCreateTaskMutation,
  useGenerateSprintPlanMutation,
  useGetProjectsQuery,
} from "@/state/api";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Gauge,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Sparkles,
  Wand2,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

const defaultGoal =
  "Transform this project management dashboard into an AI-powered recruiter demo with sprint planning, risk insights, and polished UI.";

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString();
};

const priorityStyles: Record<Priority, string> = {
  Urgent: "border-rose-200 bg-rose-50 text-rose-700",
  High: "border-amber-200 bg-amber-50 text-amber-700",
  Medium: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Low: "border-sky-200 bg-sky-50 text-sky-700",
  Backlog: "border-slate-200 bg-slate-50 text-slate-700",
};

const phaseStyles: Record<string, string> = {
  Discovery: "bg-violet-100 text-violet-700 border-violet-200",
  Execution: "bg-blue-100 text-blue-700 border-blue-200",
  Launch: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const riskCardStyles: Record<string, string> = {
  Low: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
  Medium:
    "border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
  High: "border-rose-200 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800",
};

const riskBarColor: Record<string, string> = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-rose-500",
};

const riskIcon: Record<string, React.ElementType> = {
  Low: ShieldCheck,
  Medium: ShieldAlert,
  High: ShieldX,
};

const CopilotPage = () => {
  const [goal, setGoal] = useState(defaultGoal);
  const [timeline, setTimeline] = useState("4 days");
  const [teamSize, setTeamSize] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [createdCount, setCreatedCount] = useState(0);
  const [createError, setCreateError] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  const { data: projects } = useGetProjectsQuery();
  const [generateSprintPlan, { data: plan, isLoading, error }] =
    useGenerateSprintPlanMutation();
  const [createTask, { isLoading: isCreatingTasks }] = useCreateTaskMutation();

  const selectedProject = useMemo(
    () => projects?.find((project) => project.id === Number(selectedProjectId)),
    [projects, selectedProjectId],
  );

  const totalPoints = useMemo(
    () => plan?.tasks.reduce((sum, task) => sum + task.points, 0) || 0,
    [plan],
  );

  const handleGeneratePlan = async () => {
    setCreatedCount(0);
    setCreateError(null);
    await generateSprintPlan({
      goal,
      timeline,
      teamSize,
      projectName: selectedProject?.name || "PlanPilot AI",
    });
  };

  const handleCreateTasks = async () => {
    if (!plan || !selectedProjectId) return;

    let count = 0;
    setCreateError(null);

    try {
      for (let index = 0; index < plan.tasks.length; index += 1) {
        const task = plan.tasks[index];
        await createTask({
          title: task.title,
          description: `${task.description}\n\nAI risk note: ${task.risk}`,
          status: Status.ToDo,
          priority: task.priority,
          tags: task.tags,
          points: task.points,
          startDate: addDays(new Date(), Math.floor(index / 2)),
          dueDate: addDays(new Date(), index + 1),
          authorUserId: 1,
          assignedUserId: 1,
          projectId: Number(selectedProjectId),
        }).unwrap();
        count += 1;
      }

      setCreatedCount(count);
      success(
        `${count} tasks added to ${selectedProject?.name || "your project"}.`,
      );
    } catch (createErr) {
      setCreateError("Task creation failed. Please try again.");
      toastError(
        "Task creation failed. Check that the backend is running.",
      );
    }
  };

  const RiskIcon = plan?.healthSummary
    ? riskIcon[plan.healthSummary.riskLevel] ?? ShieldCheck
    : ShieldCheck;

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-6 text-slate-950 dark:bg-dark-bg dark:text-white sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-4 w-4" />
              Demo-safe AI workflow
            </div>
            <Header name="AI Sprint Copilot" />
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Generate a recruiter-ready sprint, estimate delivery risk, and
              convert the plan into real board tasks without needing AWS or a
              paid AI subscription.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
            <Metric icon={Gauge} label="Risk" value={plan ? `${plan.riskScore}%` : "--"} />
            <Metric icon={CheckCircle2} label="Points" value={`${totalPoints}`} />
            <Metric icon={Bot} label="Mode" value="Local" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          {/* LEFT PANEL — FORM */}
          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">Sprint Generator</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Scope, plan, risk, and tasks in one pass.
                </p>
              </div>
            </div>

            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Goal
            </label>
            <textarea
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              className="min-h-36 w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 outline-none transition focus:border-slate-400 dark:border-stroke-dark dark:bg-dark-tertiary"
            />

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Timeline
                </label>
                <select
                  value={timeline}
                  onChange={(event) => setTimeline(event.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm outline-none dark:border-stroke-dark dark:bg-dark-tertiary"
                >
                  <option>3 days</option>
                  <option>4 days</option>
                  <option>1 week</option>
                  <option>2 weeks</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Team size
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={teamSize}
                  onChange={(event) => setTeamSize(Number(event.target.value))}
                  className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm outline-none dark:border-stroke-dark dark:bg-dark-tertiary"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Target project
              </label>
              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm outline-none dark:border-stroke-dark dark:bg-dark-tertiary"
              >
                <option value="">Choose a project</option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {!projects?.length ? (
                <p className="mt-2 text-xs text-slate-500">
                  No projects yet. Create one in the Projects tab to enable
                  board task creation.
                </p>
              ) : null}
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={isLoading || goal.trim().length < 8}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate Sprint Plan
            </button>

            {error && (
              <div className="mt-4 flex gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                <AlertTriangle className="h-5 w-5 flex-none" />
                The copilot could not generate a plan. Check that the backend is
                running.
              </div>
            )}
            {createError && (
              <div className="mt-4 flex gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                <AlertTriangle className="h-5 w-5 flex-none" />
                {createError}
              </div>
            )}
          </section>

          {/* RIGHT PANEL — RESULTS */}
          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
            {isLoading ? (
              <GeneratingSkeleton />
            ) : !plan ? (
              <EmptyState />
            ) : (
              <div className="flex flex-col gap-5">
                {/* PLAN HEADER */}
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-stroke-dark lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-xl font-black">{plan.projectName}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {plan.summary}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {plan.confidence}
                    </p>
                  </div>
                  <button
                    onClick={handleCreateTasks}
                    disabled={!selectedProjectId || isCreatingTasks}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCreatingTasks ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    Create Board Tasks
                  </button>
                </div>

                {/* SUCCESS STATE */}
                {createdCount > 0 && (
                  <div className="rounded-md border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 flex-none text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                          {createdCount} tasks created in{" "}
                          {selectedProject?.name}
                        </p>
                        <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                          Open the project board to review, assign, and drag
                          tasks across the Kanban columns.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link
                        href={`/projects/${selectedProjectId}`}
                        className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                      >
                        Open project board
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* HEALTH SUMMARY */}
                {plan.healthSummary && (
                  <HealthSummaryPanel
                    riskLevel={plan.healthSummary.riskLevel}
                    insight={plan.healthSummary.insight}
                    riskScore={plan.riskScore}
                  />
                )}

                {/* RECOMMENDATIONS */}
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  {plan.recommendations.map((recommendation) => (
                    <div
                      key={recommendation}
                      className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-stroke-dark dark:bg-dark-tertiary dark:text-slate-200"
                    >
                      {recommendation}
                    </div>
                  ))}
                </div>

                {/* TASK CARDS */}
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {plan.tasks.map((task, index) => (
                    <TaskPlanCard key={`${task.title}-${index}`} task={task} />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-components ────────────────────────────────────────────────────── */

const EmptyState = () => (
  <div className="flex min-h-[520px] flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-stroke-dark dark:bg-dark-tertiary">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-slate-950 text-white dark:bg-white dark:text-slate-950">
      <Bot className="h-7 w-7" />
    </div>
    <h2 className="text-xl font-black">Ready to plan the sprint.</h2>
    <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
      The generated plan will appear here with risk analysis, phase labels,
      story point estimates, and board-ready tasks.
    </p>
  </div>
);

const GeneratingSkeleton = () => (
  <div className="flex min-h-[520px] flex-col gap-4 p-2">
    <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-dark-tertiary" />
    <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-dark-tertiary" />
    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-dark-tertiary" />
    <div className="mt-4 h-20 w-full animate-pulse rounded-md bg-slate-100 dark:bg-dark-tertiary" />
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`skel-${i}`}
          className="h-32 animate-pulse rounded-md bg-slate-100 dark:bg-dark-tertiary"
        />
      ))}
    </div>
  </div>
);

const HealthSummaryPanel = ({
  riskLevel,
  insight,
  riskScore,
}: {
  riskLevel: "Low" | "Medium" | "High";
  insight: string;
  riskScore: number;
}) => {
  const Icon = riskIcon[riskLevel];
  return (
    <div
      className={`rounded-md border p-4 ${riskCardStyles[riskLevel]}`}
      aria-label="Health summary panel"
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 flex-none" />
        <span className="text-sm font-bold">
          Sprint Health — {riskLevel} Risk
        </span>
        <span className="ml-auto text-xs font-bold">{riskScore}%</span>
      </div>
      {/* Risk bar */}
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${riskBarColor[riskLevel]}`}
          style={{ width: `${riskScore}%` }}
        />
      </div>
      <p className="text-xs leading-5">{insight}</p>
    </div>
  );
};

const Metric = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="min-w-24 rounded-md bg-slate-50 p-3 dark:bg-dark-tertiary">
    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
      <Icon className="h-4 w-4" />
      {label}
    </div>
    <div className="text-lg font-black">{value}</div>
  </div>
);

const TaskPlanCard = ({ task }: { task: PlannedTask }) => {
  const isHighRisk = task.risk.toLowerCase().includes("high");

  return (
    <article
      className={`rounded-md border p-4 transition hover:shadow-sm ${
        isHighRisk
          ? "border-rose-200 hover:border-rose-300 dark:border-rose-900"
          : "border-slate-200 hover:border-slate-300 dark:border-stroke-dark dark:hover:border-slate-600"
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {/* Phase label */}
        {task.phaseLabel && (
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-bold ${phaseStyles[task.phaseLabel] ?? ""}`}
          >
            {task.phaseLabel}
          </span>
        )}
        {/* Priority badge */}
        <span
          className={`rounded-full border px-2 py-1 text-xs font-bold ${priorityStyles[task.priority]}`}
        >
          {task.priority}
        </span>
        {/* Story points */}
        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 dark:border-stroke-dark dark:bg-dark-tertiary dark:text-slate-200">
          {task.points} pts
        </span>
      </div>
      <h3 className="text-base font-black leading-6">{task.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {task.description}
      </p>
      <div
        className={`mt-4 rounded-md p-3 text-xs font-semibold leading-5 ${
          isHighRisk
            ? "bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
            : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
        }`}
      >
        {task.risk}
      </div>
    </article>
  );
};

export default CopilotPage;
