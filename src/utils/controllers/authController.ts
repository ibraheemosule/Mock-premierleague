import { Request, Response, NextFunction } from "express";
import { Model } from "mongoose";
import jwt from "jsonwebtoken";
import { ISignUpSchema, ISignIn, IToken } from "../ts-types";

const generateToken = (user: string): string => {
  return jwt.sign({ id: user }, "secret-token-id", { expiresIn: "3h" });
};

const verifyToken = (token: string): Promise<IToken> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, "secret-token-id", (err: any, payload: any) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });

const signUp = (model: Model<ISignUpSchema>) => async (req: any, res: any) => {
  const requiredFields = ["name", "username", "password", "email"];
  try {
    const { body } = req;
    let reqFieldEmpty: string | undefined;

    requiredFields.every((val: string) => {
      if (!body[val].length) {
        reqFieldEmpty = val;
        return false;
      }
      return true;
    });

    if (!!reqFieldEmpty)
      return res.status(400).json({ message: `${reqFieldEmpty} is required` });

    const admin = await model.create(body);
    if (!admin) throw new Error();
    const token = generateToken(admin?.id);
    res.status(200).json({ token });
  } catch (e) {
    return res.status(400).send(e);
  }
};

const signIn =
  (model: Model<ISignUpSchema>) => async (req: ISignIn, res: Response) => {
    if (!req.body.username || !req.body.password) return res.status(400).end();

    try {
      const user = await model
        .findOne({ username: req.body.username })
        .select("username password id")
        .exec();
      const checkPassword = await user?.checkPassword(req.body.password);

      if (!checkPassword) throw new Error();
      const token = generateToken(user?.id);
      res.status(200).json({ token });
    } catch (e) {
      res.status(401).end();
    }
  };

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1].trim();
    if (!token) throw new Error("Unauthorized");

    const user = await verifyToken(token);
    if (!user.id) throw new Error("Unauthorized");
    req.headers.authorization = user.id;

    next();
  } catch (e) {
    res.status(400).json(e);
  }
};

export const authControllers = (model: Model<ISignUpSchema>) => ({
  signIn: signIn(model),
  signUp: signUp(model),
});
