import { Request, Response, NextFunction } from "express";
import { Model } from "mongoose";
import jwt from "jsonwebtoken";
import { ISignUpSchema, ISignIn, IToken } from "../ts-types";
import { Admin } from "../../admin/admin.model";
import { dotsInGmail } from "../../utils";

const generateToken = (user: string): string => {
  return jwt.sign({ id: user }, "secret-token-id", { expiresIn: "24h" });
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

    const userDetails = dotsInGmail(body);
    console.log(userDetails);

    const admin = await model.create(userDetails);
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

    const cred = req.body.username.toLowerCase();
    const userDetails = dotsInGmail(req.body);
    console.log(userDetails);

    try {
      const user = await model
        .findOne({ $or: [{ username: cred }, { email: cred }] })
        .select("username password id")
        .exec();
      const checkPassword = await user?.checkPassword(req.body.password);

      if (!checkPassword) throw new Error();
      const token = generateToken(user?.id);
      res.status(200).json({ token });
    } catch (e) {
      res.status(401).send("Invalid username or password");
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
    res.status(401).send(e);
  }
};

export const authControllers = (model: Model<ISignUpSchema>) => ({
  signIn: signIn(model),
  signUp: signUp(model),
});
