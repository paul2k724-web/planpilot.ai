import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { demoStore, isDemoMode } from "../data/demoStore";

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (isDemoMode()) {
      res.json(demoStore.getUsers());
      return;
    }

    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving users: ${error.message}` });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId } = req.params;
  try {
    if (isDemoMode()) {
      res.json(demoStore.getUser(cognitoId));
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        cognitoId: cognitoId,
      },
    });

    res.json(user);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user: ${error.message}` });
  }
};

export const postUser = async (req: Request, res: Response) => {
  try {
    const {
      username,
      cognitoId,
      profilePictureUrl = "i1.jpg",
      teamId = 1,
    } = req.body;
    if (isDemoMode()) {
      const newUser = demoStore.createUser({
        username,
        cognitoId,
        profilePictureUrl,
        teamId,
      });
      res.json({ message: "User Created Successfully", newUser });
      return;
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        cognitoId,
        profilePictureUrl,
        teamId,
      },
    });
    res.json({ message: "User Created Successfully", newUser });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving users: ${error.message}` });
  }
};
