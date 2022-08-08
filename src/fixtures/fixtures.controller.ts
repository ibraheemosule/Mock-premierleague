import { NextFunction, Request, Response } from "express";
import { crudControllers } from "../utils/controllers/crudControllers";
import { Fixtures } from "./fixtures.model";
import { Teams } from "../teams/teams.model";
import {
  createLink,
  retrieveLink,
  userFixtures,
} from "../links/links.controllers";

const add = (model: any) => async (req: Request, res: Response) => {
  if (!req.body || !req.body.home.uid || !req.body.away.uid) {
    return res.status(400).json({ message: "Invalid body syntax" });
  }

  const { home, away } = req.body;
  if (home.uid === away.uid) {
    return res.status(400).json({ message: "Home and away is the same team" });
  }

  const reqBody = {
    home: {
      info: home.uid,
      score: home.score ?? null,
    },
    away: {
      info: away.uid,
      score: away.score ?? null,
    },
    createdBy: req.headers.authorization,
    updatedBy: req.headers.authorization,
  };

  try {
    const checkId =
      !!(await Teams.exists({
        _id: away.uid,
      })) &&
      !!(await Teams.exists({
        _id: home.uid,
      }));

    if (!checkId) throw new Error("invalid team id");

    const data = await model
      .findOneAndUpdate(
        {
          "home.info": home.uid,
          "away.info": away.uid,
        },
        reqBody,
        {
          new: true,
          upsert: true,
        }
      )
      .populate({
        path: "home.info",
        select: ["name"],
      })
      .populate({
        path: "away.info",
        select: ["name"],
      })
      .populate({
        path: "createdBy updatedBy",
        select: ["name"],
      })
      .lean()
      .exec();

    res.status(200).json({ message: "data created", data });
  } catch (e) {
    res.status(400).send(e);
  }
};

const getAll = (model: any) => async (req: Request, res: Response) => {
  try {
    const data = await model
      .find({})
      .populate({
        path: "home.info",
        select: ["id", "name"],
      })
      .populate({
        path: "away.info",
        select: ["id", "name"],
      })
      .populate({
        path: "updatedBy",
        select: ["id", "name"],
      })
      .lean()
      .exec();
    res.status(200).json({ data });
  } catch (e) {
    res.status(400).end();
  }
};

const getOne =
  (model: any) => async (req: Request, res: Response, next: NextFunction) => {
    const search = /search/i.test(req.originalUrl);
    if (!search) return next();

    const query = req.query.search as string;

    try {
      const dbResponse = await model
        .findOne({ _id: query })
        .populate({
          path: "home.info",
          select: ["id", "name"],
        })
        .populate({
          path: "away.info",
          select: ["id", "name"],
        })
        .populate({
          path: "updatedBy",
          select: ["id", "name"],
        })
        .lean()
        .exec();
      res.status(200).json({ data: dbResponse });
    } catch (e) {
      res.status(400).send(e);
    }
  };

export default {
  ...crudControllers(Fixtures),
  getAll: getAll(Fixtures),
  getOne: getOne(Fixtures),
  add: add(Fixtures),
  link: createLink,
  retrieveLink,
  userFixtures,
};
