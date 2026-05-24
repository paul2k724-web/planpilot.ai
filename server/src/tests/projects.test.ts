process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "true";

import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";

const getApp = async () => (await import("../index")).default;

test("GET /projects returns demo projects", async () => {
  const app = await getApp();
  const response = await request(app).get("/projects").expect(200);

  assert.ok(Array.isArray(response.body));
  assert.ok(response.body.length > 0);
  assert.ok(response.body[0].name);
});

test("POST /projects creates a new project", async () => {
  const app = await getApp();
  const response = await request(app)
    .post("/projects")
    .send({
      name: "Test Project",
      description: "Created by automated test",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
    })
    .expect(201);

  assert.ok(response.body.id);
  assert.equal(response.body.name, "Test Project");
});
