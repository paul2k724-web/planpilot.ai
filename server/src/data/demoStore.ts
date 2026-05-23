import projectsSeed from "../../prisma/seedData/project.json";
import tasksSeed from "../../prisma/seedData/task.json";
import usersSeed from "../../prisma/seedData/user.json";
import teamsSeed from "../../prisma/seedData/team.json";
import commentsSeed from "../../prisma/seedData/comment.json";
import attachmentsSeed from "../../prisma/seedData/attachment.json";

type AnyRecord = Record<string, any>;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const projects: AnyRecord[] = (clone(projectsSeed) as AnyRecord[]).map(
  (project, index) => ({
    ...project,
    startDate: addDays(index * -7),
    endDate: addDays(index < 3 ? index * -3 - 1 : index * 12 + 15),
  })
);
const users: AnyRecord[] = (clone(usersSeed) as AnyRecord[]).map((user, index) => ({
  userId: index + 1,
  email: `${user.username.toLowerCase()}@planpilot.ai`,
  ...user,
}));
const teams: AnyRecord[] = (clone(teamsSeed) as AnyRecord[]).map((team, index) => ({
  id: index + 1,
  ...team,
}));
const taskStatuses = [
  "Completed",
  "Work In Progress",
  "To Do",
  "Under Review",
  "To Do",
];
const tasks: AnyRecord[] = (clone(tasksSeed) as AnyRecord[]).map((task) => ({
  ...task,
  status: taskStatuses[task.id % taskStatuses.length],
  startDate: addDays((task.id % 9) - 6),
  dueDate: addDays((task.id % 11) + (task.priority === "Urgent" ? 1 : 5)),
  points: task.points ?? Math.max(2, (task.id % 5) + 2),
}));
const comments = clone(commentsSeed) as AnyRecord[];
const attachments = clone(attachmentsSeed) as AnyRecord[];

export const isDemoMode = () =>
  process.env.DEMO_MODE === "true" || !process.env.DATABASE_URL;

const withTaskRelations = (task: AnyRecord) => ({
  ...task,
  author: users.find((user) => user.userId === task.authorUserId) || null,
  assignee: users.find((user) => user.userId === task.assignedUserId) || null,
  comments: comments.filter((comment) => comment.taskId === task.id),
  attachments: attachments.filter((attachment) => attachment.taskId === task.id),
});

const includes = (value: unknown, query: string) =>
  String(value || "")
    .toLowerCase()
    .includes(query.toLowerCase());

export const demoStore = {
  getProjects: () => projects,

  createProject: (data: AnyRecord) => {
    const project = {
      id: Math.max(...projects.map((item) => item.id)) + 1,
      ...data,
    };
    projects.push(project);
    return project;
  },

  getTasks: (projectId?: number) =>
    tasks
      .filter((task) => !projectId || task.projectId === projectId)
      .map(withTaskRelations),

  createTask: (data: AnyRecord) => {
    const task = {
      id: Math.max(...tasks.map((item) => item.id)) + 1,
      status: "To Do",
      priority: "Backlog",
      points: 3,
      ...data,
    };
    tasks.push(task);
    return withTaskRelations(task);
  },

  updateTaskStatus: (taskId: number, status: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return null;

    task.status = status;
    return withTaskRelations(task);
  },

  getUserTasks: (userId: number) =>
    tasks
      .filter(
        (task) => task.authorUserId === userId || task.assignedUserId === userId
      )
      .map(withTaskRelations),

  getUsers: () => users,

  getUser: (cognitoId: string) =>
    users.find((user) => user.cognitoId === cognitoId) || users[0],

  createUser: (data: AnyRecord) => {
    const user = {
      userId: Math.max(...users.map((item) => item.userId)) + 1,
      email: `${data.username?.toLowerCase() || "demo"}@planpilot.ai`,
      profilePictureUrl: "i1.jpg",
      teamId: 1,
      ...data,
    };
    users.push(user);
    return user;
  },

  getTeams: () =>
    teams.map((team) => ({
      ...team,
      productOwnerUsername: users.find(
        (user) => user.userId === team.productOwnerUserId
      )?.username,
      projectManagerUsername: users.find(
        (user) => user.userId === team.projectManagerUserId
      )?.username,
    })),

  search: (query: string) => ({
    tasks: tasks
      .filter(
        (task) => includes(task.title, query) || includes(task.description, query)
      )
      .map(withTaskRelations),
    projects: projects.filter(
      (project) =>
        includes(project.name, query) || includes(project.description, query)
    ),
    users: users.filter((user) => includes(user.username, query)),
  }),
};
