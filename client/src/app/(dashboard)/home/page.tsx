"use client";

import Header from "@/components/Header";
import {
  Priority,
  Project,
  Task,
  useGetProjectsQuery,
  useGetTasksQuery,
} from "@/state/api";
import { useAppSelector } from "../../redux";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Gauge,
  Sparkles,
} from "lucide-react";
import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import Link from "next/link";

const taskColumns: GridColDef[] = [
  { field: "title", headerName: "Task", flex: 1, minWidth: 220 },
  { field: "status", headerName: "Status", width: 160 },
  { field: "priority", headerName: "Priority", width: 140 },
  { field: "dueDate", headerName: "Due Date", width: 150 },
];

const COLORS = ["#0f172a", "#059669", "#d97706", "#dc2626", "#2563eb"];

const HomePage = () => {
  const { data: projects, isLoading: isProjectsLoading } =
    useGetProjectsQuery();
  const activeProjectId = projects?.[0]?.id;
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetTasksQuery(
    { projectId: activeProjectId || 0 },
    { skip: !activeProjectId },
  );

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const dashboard = useMemo(() => {
    const taskList = tasks || [];
    const totalTasks = taskList.length;
    const completedTasks = taskList.filter(
      (task) => task.status === "Completed",
    ).length;
    const urgentTasks = taskList.filter(
      (task) => task.priority === Priority.Urgent,
    ).length;
    const overdueTasks = taskList.filter((task) => {
      if (!task.dueDate || task.status === "Completed") return false;
      return new Date(task.dueDate).getTime() < Date.now();
    }).length;
    const completionRate = totalTasks
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;
    const healthScore = Math.max(
      12,
      Math.min(98, completionRate + 32 - urgentTasks * 7 - overdueTasks * 10),
    );

    return {
      totalTasks,
      completedTasks,
      urgentTasks,
      overdueTasks,
      completionRate,
      healthScore,
    };
  }, [tasks]);

  if (tasksLoading || isProjectsLoading) {
    return <DashboardSkeleton />;
  }

  if (tasksError || !projects) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-8 dark:bg-dark-bg">
        <div className="max-w-md rounded-md border border-rose-200 bg-white p-8 text-center shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-rose-100 dark:bg-rose-950">
            <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Could not load dashboard
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            The backend may not be running. Start the server with{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs dark:bg-dark-tertiary">
              npm run dev
            </code>{" "}
            in the{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs dark:bg-dark-tertiary">
              server
            </code>{" "}
            directory, then refresh.
          </p>
        </div>
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="min-h-screen bg-slate-50 px-5 py-6 text-slate-950 dark:bg-dark-bg dark:text-white sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <section className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
            <h2 className="text-2xl font-black">No projects yet</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Create a project to see dashboards, analytics, and AI sprint planning.
            </p>
          </section>
        </div>
      </div>
    );
  }

  const taskList = tasks || [];
  const priorityCount = taskList.reduce(
    (acc: Record<string, number>, task: Task) => {
      const priority = task.priority || "Backlog";
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    },
    {},
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  const statusCount = projects.reduce(
    (acc: Record<string, number>, project: Project) => {
      const status =
        project.endDate && new Date(project.endDate).getTime() < Date.now()
          ? "Completed"
          : "Active";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {},
  );

  const projectStatus = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));

  const chartColors = isDarkMode
    ? {
        bar: "#34d399",
        barGrid: "#2d3135",
        text: "#FFFFFF",
      }
    : {
        bar: "#0f172a",
        barGrid: "#e2e8f0",
        text: "#0f172a",
      };

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-6 text-slate-950 dark:bg-dark-bg dark:text-white sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                <Sparkles className="h-4 w-4" />
                Portfolio-ready command center
              </div>
              <Header name="PlanPilot AI Dashboard" />
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                A focused project delivery workspace with Kanban execution,
                timeline visibility, search, risk signals, and AI sprint
                planning.
              </p>
            </div>
            <Link
              href="/copilot"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            >
              Open AI Copilot
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InsightCard
            icon={Gauge}
            label="Health Score"
            value={`${dashboard.healthScore}%`}
            tone="slate"
          />
          <InsightCard
            icon={CheckCircle2}
            label="Completion"
            value={`${dashboard.completionRate}%`}
            tone="emerald"
          />
          <InsightCard
            icon={AlertTriangle}
            label="Urgent Tasks"
            value={`${dashboard.urgentTasks}`}
            tone="amber"
          />
          <InsightCard
            icon={CalendarClock}
            label="Overdue"
            value={`${dashboard.overdueTasks}`}
            tone="rose"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartPanel title="Task Priority Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskDistribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartColors.barGrid}
                />
                <XAxis dataKey="name" stroke={chartColors.text} />
                <YAxis stroke={chartColors.text} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill={chartColors.bar} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel title="Project Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie dataKey="count" data={projectStatus} fill="#82ca9d" label>
                  {projectStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartPanel>
        </div>

        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-black">Execution Queue</h3>
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {dashboard.totalTasks} tasks
            </span>
          </div>
          {!taskList.length ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-600 dark:border-stroke-dark dark:bg-dark-tertiary dark:text-slate-300">
              No tasks yet. Create tasks from AI Copilot to populate the queue.
            </div>
          ) : (
          <div className="h-[430px] w-full">
            <DataGrid
              rows={taskList}
              columns={taskColumns}
              checkboxSelection
              loading={tasksLoading}
              getRowClassName={() => "data-grid-row"}
              getCellClassName={() => "data-grid-cell"}
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
            />
          </div>
          )}
        </section>
      </div>
    </div>
  );
};

const toneStyles = {
  slate: "bg-slate-950 text-white dark:bg-white dark:text-slate-950",
  emerald: "bg-emerald-600 text-white",
  amber: "bg-amber-500 text-white",
  rose: "bg-rose-600 text-white",
};

const InsightCard = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: keyof typeof toneStyles;
}) => (
  <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
    <div
      className={`mb-5 flex h-10 w-10 items-center justify-center rounded-md ${toneStyles[tone]}`}
    >
      <Icon className="h-5 w-5" />
    </div>
    <div className="text-3xl font-black">{value}</div>
    <div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
      {label}
    </div>
  </div>
);

const ChartPanel = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
    <h3 className="mb-4 text-base font-black">{title}</h3>
    {children}
  </section>
);

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-slate-50 px-5 py-6 text-slate-950 dark:bg-dark-bg dark:text-white sm:px-8">
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
        <div className="h-6 w-40 rounded bg-slate-200 dark:bg-dark-tertiary" />
        <div className="mt-3 h-4 w-72 rounded bg-slate-200 dark:bg-dark-tertiary" />
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`card-${index}`}
            className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary"
          >
            <div className="h-10 w-10 rounded bg-slate-200 dark:bg-dark-tertiary" />
            <div className="mt-4 h-7 w-20 rounded bg-slate-200 dark:bg-dark-tertiary" />
            <div className="mt-2 h-3 w-28 rounded bg-slate-200 dark:bg-dark-tertiary" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <section
            key={`chart-${index}`}
            className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary"
          >
            <div className="mb-4 h-4 w-40 rounded bg-slate-200 dark:bg-dark-tertiary" />
            <div className="h-[260px] rounded bg-slate-100 dark:bg-dark-tertiary" />
          </section>
        ))}
      </div>

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
        <div className="mb-4 h-4 w-32 rounded bg-slate-200 dark:bg-dark-tertiary" />
        <div className="h-[320px] rounded bg-slate-100 dark:bg-dark-tertiary" />
      </section>
    </div>
  </div>
);

export default HomePage;
