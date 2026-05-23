import { Router } from "express";
import { generateSprintPlan } from "../controllers/aiController";

const router = Router();

router.post("/sprint-plan", generateSprintPlan);

export default router;
