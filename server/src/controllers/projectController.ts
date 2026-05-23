import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { demoStore, isDemoMode } from "../data/demoStore";

const prisma = new PrismaClient();

export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (isDemoMode()) {
      res.json(demoStore.getProjects());
      return;
    }

    const projects = await prisma.project.findMany();
    res.json(projects);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving projects: ${error.message}` });
  }
};

export const createProject = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, description, startDate, endDate } = req.body;
  try {
    if (isDemoMode()) {
      res.status(201).json(
        demoStore.createProject({
          name,
          description,
          startDate,
          endDate,
        })
      );
      return;
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        startDate,
        endDate,
      },
    });
    res.status(201).json(newProject);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating a project: ${error.message}` });
  }
};
