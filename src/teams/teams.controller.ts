import { NextFunction, Request, Response } from "express";
import { crudControllers as controller } from "../utils/controllers/crudControllers";
import { Teams } from "./teams.model";
import mongoose from "mongoose";

const getAll = (model: any) => async (req: Request, res: Response) => {
  try {
    const data = await model
      .find({})
      //   .populate({
      //     path: "fixtures",
      //     select: ["status", "home.score", "away.score"],
      //     populate: {
      //       path: "home.info away.info",
      //       model: "team",
      //       select: ["name"],
      //     },
      //   })
      .populate({
        path: "createdBy",
        select: ["id", "name"],
      })
      .select({ fixtures: 0 })
      .lean()
      .exec();

    console.log(data, "here");
    res.status(200).json({ data });
  } catch (e) {
    console.log("errror here");
    res.status(400).end();
  }
};

const getOne =
  (model: any) => async (req: Request, res: Response, next: NextFunction) => {
    const search = /search/i.test(req.originalUrl);
    if (!search) return next();

    const query = req.query.search as string;
    const queryType = mongoose.Types.ObjectId.isValid(query);

    try {
      const key = queryType ? "_id" : "name";
      const dbResponse = await model
        .findOne({ [key]: query.toLowerCase() })
        .populate({
          path: "fixtures",
          select: ["status", "home.score", "away.score"],
          populate: {
            path: "home.info away.info",
            model: "team",
            select: ["name"],
          },
        })
        .populate({
          path: "createdBy",
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
  ...controller(Teams),
  getOne: getOne(Teams),
  getAll: getAll(Teams),
};
