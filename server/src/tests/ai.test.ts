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

test("POST /ai/sprint-plan includes riskScore and confidence", async () => {
  const app = await getApp();
  const response = await request(app)
    .post("/ai/sprint-plan")
    .send({
      goal: "Build a portfolio-ready dashboard",
      timeline: "1 week",
      teamSize: 1,
    })
    .expect(200);

  assert.ok(typeof response.body.riskScore === "number");
  assert.ok(response.body.riskScore >= 0 && response.body.riskScore <= 100);
  assert.ok(typeof response.body.confidence === "string");
});

test("POST /ai/sprint-plan includes healthSummary", async () => {
  const app = await getApp();
  const response = await request(app)
    .post("/ai/sprint-plan")
    .send({
      goal: "Launch AI sprint copilot feature",
      timeline: "4 days",
      teamSize: 1,
    })
    .expect(200);

  assert.ok(response.body.healthSummary, "healthSummary should be present");
  assert.ok(
    ["Low", "Medium", "High"].includes(response.body.healthSummary.riskLevel),
    "riskLevel should be Low, Medium, or High",
  );
  assert.ok(
    typeof response.body.healthSummary.insight === "string",
    "insight should be a string",
  );
});

test("POST /ai/sprint-plan tasks each have a phaseLabel", async () => {
  const app = await getApp();
  const response = await request(app)
    .post("/ai/sprint-plan")
    .send({
      goal: "Build a recruiter-ready demo product",
      timeline: "4 days",
      teamSize: 1,
    })
    .expect(200);

  const validPhases = ["Discovery", "Execution", "Launch"];
  for (const task of response.body.tasks) {
    assert.ok(
      validPhases.includes(task.phaseLabel),
      `Task "${task.title}" should have a valid phaseLabel`,
    );
  }
});

test("POST /ai/sprint-plan rejects goal shorter than 8 chars", async () => {
  const app = await getApp();
  const response = await request(app)
    .post("/ai/sprint-plan")
    .send({ goal: "Short" })
    .expect(400);

  assert.ok(response.body.message);
});
