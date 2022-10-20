import cuid from "cuid";
import { NextFunction, Request, Response } from "express";
import { Links } from "./links.model";
import { Fixtures } from "../fixtures/fixtures.model";
import mongoose from "mongoose";

export const createLink = async (req: Request, res: Response) => {
  if (!req.body || !req.body.uid) {
    return res.status(400).json({ message: "Invalid body syntax" });
  }
  const id = req.headers.authorization;
  const randomString: string = cuid() + id + cuid() + cuid();
  const uidCheck = mongoose.Types.ObjectId.isValid(req.body.uid.trim());

  try {
    if (!uidCheck) throw new Error();

    const verifyId = await Fixtures.exists({ _id: req.body.uid.trim() });
    if (!verifyId) throw new Error();

    let link = await Links.create({
      createdBy: id,
      linkString: randomString,
      fixture: req.body.uid.trim(),
    });

    link = await link.populate({
      path: "fixture",
      select: ["home", "away", "status"],
      populate: {
        path: "home.info away.info",
        model: "team",
        select: "name",
      },
    });

    res.status(201).json({ data: link });
  } catch (e) {
    res.status(400).json("Could not find a fixture with this id");
  }
};

export const retrieveLink = async (req: Request, res: Response) => {
  const { linkId } = req.params;
  if (!linkId) return res.status(404).json();
  try {
    const fixture = await Links.findOne({ linkString: linkId })
      .select({ fixture: 1 })
      .populate({
        path: "fixture",
        select: ["home", "away", "status"],
        populate: {
          path: "homeTeam awayTeam",
          model: "team",
          select: "name",
        },
      });

    if (!fixture?.fixture) throw new Error();
    res.status(200).json({ data: fixture });
  } catch (e) {
    res.status(400).json("invalid link");
  }
};

export const userFixtures = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) return res.status(401).json("invalid id");

  try {
    const fixtures = await Links.find({
      createdBy: req.headers.authorization,
    })
      .select({ fixture: 1 })
      .populate({
        path: "fixture",
        select: ["home", "away", "status"],
        populate: {
          path: "home.info away.info",
          model: "team",
          select: "name",
        },
      });

    res.status(200).json({ data: fixtures });
  } catch (e) {
    res.status(400).json("this link does not exist");
  }
};
