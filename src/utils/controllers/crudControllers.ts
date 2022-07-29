import { Request, Response } from "express";
import mongoose from "mongoose";

const add = (model: any) => async (req: Request, res: Response) => {
  if (!req.body) res.status(400).json({ message: "No name specified" });
  try {
    const { body } = req;
    const data = await model.create({
      ...body,
      createdBy: new mongoose.Types.ObjectId(),
    });
    res.status(200).json({ message: "data created" });
  } catch (e) {
    res.status(400).send(e);
  }
};

const getAll = (model: any) => async (req: Request, res: Response) => {
  try {
    const data = await model
      .find({}, { createdBy: 0, password: 0, username: 0 })
      .lean()
      .exec();
    res.status(200).json({ data });
  } catch (e) {
    res.status(400).end();
  }
};

const remove = (model: any) => async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const del = await model.findByIdAndRemove(id);
    res.status(200).json({ data: { message: "removed data", data: del } });
  } catch (e) {
    res.status(400).end();
  }
};

const getOne = (model: any) => async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    if (!id) {
      throw Error("no id provided");
    }
    const dbResponse = await model.findById(id, {
      createdBy: 0,
      password: 0,
      username: 0,
    });
    res.status(200).json({ data: dbResponse });
  } catch (e) {
    res.status(400).send(e);
  }
};

export const crudControllers = (model: any) => ({
  add: add(model),
  getAll: getAll(model),
  remove: remove(model),
  getOne: getOne(model),
});
