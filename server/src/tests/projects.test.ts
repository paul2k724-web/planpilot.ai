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
