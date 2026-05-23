process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "true";

import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";

const getApp = async () => (await import("../index")).default;

test("POST /ai/sprint-plan returns sprint plan", async () => {
  const app = await getApp();
  const response = await request(app)
    .post("/ai/sprint-plan")
    .send({
      goal: "Build a recruiter demo for PlanPilot AI",
      timeline: "4 days",
      teamSize: 2,
      projectName: "PlanPilot AI",
    })
    .expect(200);

  assert.ok(response.body.projectName);
  assert.ok(Array.isArray(response.body.tasks));
  assert.ok(response.body.tasks.length > 0);
});
