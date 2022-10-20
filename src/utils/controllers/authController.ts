import { Request, Response, NextFunction } from "express";
import { Model } from "mongoose";
import jwt from "jsonwebtoken";
import { ISignUpSchema, ISignIn, IToken } from "../ts-types";
import { Admin } from "../../admin/admin.model";
import { removeExtraDotsInGmail } from "../../utils";

export const generateToken = (user: string): string =>
  jwt.sign({ id: user }, "secret-token-id", {
    expiresIn: process.env.NODE_ENV ? "10s" : "10000h",
  });

export const verifyToken = (token: string): Promise<IToken> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, "secret-token-id", (err: any, payload: any) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });

const signUp =
  (model: Model<ISignUpSchema>) => async (req: Request, res: Response) => {
    const requiredFields = ["name", "username", "password", "email"];

    try {
      const { body } = req;

      let reqFieldEmpty: string | undefined;
      requiredFields.every((val: string) => {
        if (!body[val]) {
          reqFieldEmpty = val;
          return false;
        }
        return true;
      });

      if (!!reqFieldEmpty)
        return res
          .status(400)
          .json({ message: `${reqFieldEmpty} is required` });

      const checkUsername = /^[a-zA-Z0-9_]*$/.test(body.username),
        checkName = /^[a-zA-Z\s]*$/.test(body.name);

      if (!checkUsername || !checkName || Number(body.username)) {
        return res.status(400).json({
          username: `username should be letters and number only`,
          name: `name should be letters and spaces only`,
        });
      }

      removeExtraDotsInGmail(body);

      const admin = await model.create(req.body);
      if (!admin.id) throw new Error();
      const token = generateToken(admin?.id);

      res.status(200).json({ token });
    } catch (e) {
      return res.status(400).json(e);
    }
  };

const signIn =
  (model: Model<ISignUpSchema>) => async (req: ISignIn, res: Response) => {
    if (!req.body.username || !req.body.password) return res.status(400).json();

    //verification of email needs to be done here console.log
    removeExtraDotsInGmail(req.body);

    const username = req.body.username.toLowerCase();

    try {
      const user = await model
        .findOne({
          $or: [{ username: username }, { email: username }],
        })
        .select("username password id")
        .exec();

      const checkPassword = await user?.checkPassword(req.body.password);

      if (!checkPassword) throw new Error();
      const token = generateToken(user?.id);

      res.status(200).json({ token });
    } catch (e) {
      res.status(401).json("Invalid username or password");
    }
  };

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1].trim();
    if (!token) throw new Error();

    const user = await verifyToken(token);
    if (!user.id) throw new Error();
    req.headers.authorization = user.id;

    next();
  } catch (e) {
    res.status(401).json("unauthorized");
  }
};

export const verifyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const admin = await Admin.findById(req.headers.authorization).exec();
    if (!admin?.id) throw new Error("Unauthorized");
    next();
  } catch (e) {
    res.status(401).json(e);
  }
};

export const authControllers = (model: Model<ISignUpSchema>) => ({
  signIn: signIn(model),
  signUp: signUp(model),
});
