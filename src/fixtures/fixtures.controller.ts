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
  if (!req.body?.homeTeam || !req.body?.awayTeam) {
    return res.status(400).json({ message: "Invalid body syntax" });
  }

  const { homeTeam, awayTeam, status, homeScore, awayScore } = req.body;

  if (homeTeam === awayTeam) {
    return res.status(400).json({ message: "Home and away is the same team" });
  }

  const reqBody = {
    ...req.body,
    createdBy: req.headers.authorization,
    updatedBy: req.headers.authorization,
  };

  try {
    const checkId =
      !!(await Teams.exists({
        _id: awayTeam,
      })) &&
      !!(await Teams.exists({
        _id: homeTeam,
      }));

    if (!checkId) throw new Error("invalid team id");

    let data = await model.create(reqBody);
    data = await data.populate({
      path: "homeTeam awayTeam createdBy updatedBy",
      select: "name -_id",
    });
    // .populate({
    //   path: "homeTeam",
    //   select: ["name"],
    // })
    // .populate({
    //   path: "awayTeam",
    //   select: ["name"],
    // })
    // .populate({
    //   path: "createdBy updatedBy",
    //   select: ["name"],
    // })
    // .lean()
    // .exec();

    res.status(200).json({ message: "data created", data });
  } catch (e) {
    res.status(400).json(e);
  }
};

const getAll = (model: any) => async (req: Request, res: Response) => {
  const status = req.originalUrl.slice(req.originalUrl.lastIndexOf("/") + 1),
    paramValues = ["pending", "completed"],
    query = paramValues.includes(status) ? { status } : {};

  try {
    const data = await model
      .find(query)
      .populate({
        path: "homeTeam awayTeam",
        select: { name: 1, _id: 0 },
      })
      .populate({
        path: "updatedBy",
        select: { name: 1, _id: 0 },
      })
      .populate({
        path: "createdBy",
        select: { name: 1, _id: 0 },
      })
      .select({
        createdBy: 0,
        createdAt: 0,
        updatedBy: 0,
        updatedAt: 0,
        __v: 0,
      })
      .lean()
      .exec();

    res.status(200).json({ data });
  } catch (e) {
    res.status(400).json("an error occured while trying to get fixtures");
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
          path: "homeTeam",
          select: ["id", "name"],
        })
        .populate({
          path: "awayTeam",
          select: ["id", "name"],
        })
        .populate({
          path: "updatedBy",
          select: "name -_id",
        })
        .populate({
          path: "createdBy",
          select: "name -_id",
        })
        .lean()
        .exec();
      res.status(200).json({ data: dbResponse });
    } catch (e) {
      res.status(400).json(e);
    }
  };

const search = (model: any) => async (req: Request, res: Response) => {
  const query = req.query.search as string;

  try {
    if (!query) throw Error("No search query");
    let data = await model
      .find()
      .populate({
        path: "homeTeam awayTeam",
        model: "team",
        select: { name: 1, _id: 0 },
      })
      // .aggregate([
      //   {
      //     $match: {
      //       _id: "634818c38f6319aac96d3984",
      //     },
      //   },
      // ])

      // .aggregate([
      //   {
      //     $match: {
      //       $or: [{ "home.info.name": query }, { "away.info.name": query }],
      //     },
      //   },
      // ])
      // .select(
      //   {},
      //   { $or: [{ "home.info.name": query }, { "away.info.name": query }] }
      // )
      // .populate({
      //   path: "updatedBy",
      //   select: { name: 1, _id: 0 },
      // })
      .select({
        homeTeam: 1,
        awayTeam: 1,
        homeScore: 1,
        awayScore: 1,
        status: 1,
      })
      // .select({
      //   $or: [{ "home.info.name": query }, { "away.info.name": query }],
      // })
      .lean()
      .exec();

    data = data.filter(
      (val: any) => val.homeTeam.name === query || val.awayTeam.name === query
    );

    res.status(200).json({ data });
  } catch (e) {
    res.status(400).json(e);
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
  search: search(Fixtures),
};
