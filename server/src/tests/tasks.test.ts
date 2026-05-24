process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "true";

import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";

const getApp = async () => (await import("../index")).default;

test("GET /tasks returns tasks for a project", async () => {
  const app = await getApp();
  const response = await request(app)
    .get("/tasks")
    .query({ projectId: 1 })
    .expect(200);

  assert.ok(Array.isArray(response.body));
  assert.ok(response.body.length > 0);
});

test("POST /tasks creates a new task", async () => {
  const app = await getApp();
  const response = await request(app)
    .post("/tasks")
    .send({
      title: "Automated test task",
      description: "Created by test suite",
      status: "To Do",
      priority: "Medium",
      points: 3,
      projectId: 1,
      authorUserId: 1,
      assignedUserId: 1,
    })
    .expect(201);

  assert.ok(response.body.id);
  assert.equal(response.body.title, "Automated test task");
});

test("GET /tasks includes the newly created task", async () => {
  const app = await getApp();
  const createRes = await request(app)
    .post("/tasks")
    .send({
      title: "Task to find after creation",
      status: "To Do",
      priority: "Low",
      points: 2,
      projectId: 1,
      authorUserId: 1,
    })
    .expect(201);

  const listRes = await request(app)
    .get("/tasks")
    .query({ projectId: 1 })
    .expect(200);

  const found = listRes.body.find(
    (t: { id: number }) => t.id === createRes.body.id,
  );
  assert.ok(found, "Newly created task should appear in task list");
});
