import { Request, Response } from "express";

type SprintPlanRequest = {
  goal?: string;
  timeline?: string;
  teamSize?: number;
  projectName?: string;
};

type PlannedTask = {
  title: string;
  description: string;
  priority: "Urgent" | "High" | "Medium" | "Low" | "Backlog";
  status: "To Do" | "Work In Progress" | "Under Review" | "Completed";
  points: number;
  tags: string;
  risk: string;
};

const discoveryTemplates = [
  "Clarify success metrics and acceptance criteria",
  "Map user journeys and edge cases",
  "Define data model and API contracts",
];

const executionTemplates = [
  "Build core user workflow",
  "Implement dashboard insights and status tracking",
  "Add validation, error states, and empty states",
  "Connect persistence and update flows",
];

const launchTemplates = [
  "Run QA pass across desktop and mobile",
  "Prepare demo data and recruiter walkthrough",
  "Ship deployment checklist and README proof",
];

const getPriority = (index: number): PlannedTask["priority"] => {
  if (index <= 1) return "Urgent";
  if (index <= 3) return "High";
  if (index <= 6) return "Medium";
  return "Low";
};

const estimatePoints = (title: string, index: number) => {
  const complexityWords = ["api", "model", "workflow", "dashboard", "qa"];
  const complexityBoost = complexityWords.some((word) =>
    title.toLowerCase().includes(word)
  )
    ? 3
    : 1;

  return Math.min(13, 2 + complexityBoost + (index % 4) * 2);
};

const createTasks = (goal: string): PlannedTask[] => {
  const templates = [
    ...discoveryTemplates,
    ...executionTemplates,
    ...launchTemplates,
  ];

  return templates.map((template, index) => ({
    title: `${template} for ${goal}`,
    description:
      index < 3
        ? `Turn the goal into a clear delivery plan: ${goal}. Capture assumptions, constraints, and the final demo outcome.`
        : index < 7
          ? `Implement the most visible working slice for: ${goal}. Keep it demo-friendly, measurable, and easy to explain.`
          : `Polish and prove the work for: ${goal}. The output should be stable enough for a live recruiter walkthrough.`,
    priority: getPriority(index),
    status: "To Do",
    points: estimatePoints(template, index),
    tags:
      index < 3
        ? "planning,scope,requirements"
        : index < 7
          ? "build,product,delivery"
          : "qa,launch,portfolio",
    risk:
      index < 2
        ? "High leverage item. If this is vague, the sprint will drift."
        : index < 7
          ? "Medium risk. Keep the slice small and demoable."
          : "Low risk, but it decides how professional the project feels.",
  }));
};

export const generateSprintPlan = async (
  req: Request<{}, {}, SprintPlanRequest>,
  res: Response
): Promise<void> => {
  const goal = req.body.goal?.trim();
  const timeline = req.body.timeline?.trim() || "4 days";
  const teamSize = Number(req.body.teamSize || 1);
  const projectName = req.body.projectName?.trim() || "PlanPilot AI";

  if (!goal || goal.length < 8) {
    res.status(400).json({
      message: "Please provide a clearer project goal with at least 8 characters.",
    });
    return;
  }

  const tasks = createTasks(goal);
  const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
  const capacity = Math.max(1, teamSize) * 30;
  const riskScore = Math.min(96, Math.round((totalPoints / capacity) * 35));

  res.json({
    projectName,
    summary: `${projectName} can be shaped into a recruiter-ready sprint in ${timeline} by focusing on the highest-visibility workflow first, then proving it with clean UX and demo data.`,
    riskScore,
    confidence:
      riskScore > 75
        ? "Aggressive. Reduce scope or extend the timeline."
        : riskScore > 50
          ? "Challenging but realistic with tight execution."
          : "Healthy scope for a focused portfolio sprint.",
    recommendations: [
      "Keep one AI workflow polished end-to-end instead of adding many shallow AI buttons.",
      "Use demo mode and free deployment services so the recruiter can open the project instantly.",
      "Record a 90-second walkthrough and place it at the top of the README.",
    ],
    tasks,
  });
};
