import { NextFunction, Request, Response } from "express";

const add = (model: any) => async (req: Request, res: Response) => {
  if (!req.body) res.status(400).json({ message: "No name specified" });
  try {
    const { body } = req;
    const data = await model.create({
      ...body,
      createdBy: req.headers.authorization,
    });
    res.status(200).json({ message: "data created" });
  } catch (e) {
    res.status(400).json(e);
  }
};

const getAll = (model: any) => async (req: Request, res: Response) => {
  try {
    const data = await model
      .find({}, { password: 0, username: 0 })
      .lean()
      .exec();
    if (!data.length) return res.json("No data");
    res.status(200).json({ data });
  } catch (e) {
    res.status(400).json();
  }
};

const remove = (model: any) => async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const del = await model.findOneAndRemove({ _id: id });
    res
      .status(200)
      .json({ data: { message: "removed data", data: del.toObject() } });
  } catch (e) {
    res.status(400).json(e);
  }
};

const getOne =
  (model: any) => async (req: Request, res: Response, next: NextFunction) => {
    const search = /search/i.test(req.originalUrl);

    if (!search) return next();

    const query = req.query.search as string;

    try {
      const dbResponse = await model
        .findOne(
          { _id: query.toLowerCase() },
          {
            createdBy: 0,
            password: 0,
          }
        )
        .lean()
        .exec();
      if (!dbResponse) throw new Error("No data found");
      res.status(200).json({ data: dbResponse });
    } catch (e) {
      res.status(400).json(e);
    }
  };

const update = (model: any) => async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    if (!id) throw new Error("Cannot Find Data");

    const data = await model
      .findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .select("-createdBy -password")
      .exec();

    if (!data) throw new Error("No Data Found");
    res.status(201).json({ message: "data updated" });
  } catch (e) {
    res.status(400).json(e);
  }
};

export const crudControllers = (model: any) => ({
  add: add(model),
  getAll: getAll(model),
  remove: remove(model),
  getOne: getOne(model),
  update: update(model),
});
