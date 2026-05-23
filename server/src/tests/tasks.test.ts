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
