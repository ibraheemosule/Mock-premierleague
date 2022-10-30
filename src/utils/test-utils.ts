import { ISignIn, ITestSignIn } from "./ts-types";
import { Request, Response } from "express";

const signInParams = {
  req: {
    body: {
      username: "johndoe",
      password: "johndoe88.",
    },
  } as unknown as ISignIn,
  res: {
    json(result: { [key: string]: string }) {
      global.admin = `Bearer ${result.token}`;
    },
    status(code: number) {
      return this;
    },
  } as unknown as Response,
};

export const testSignIn: ITestSignIn = async ({
  signIn,
  req = signInParams.req,
  res = signInParams.res,
  account = "admin",
}) => {
  signInParams.res.json = function (result: { [key: string]: string }) {
    // account as any as keyof typeof globalThis;
    account === "admin"
      ? (global.admin = `Bearer ${result.token}`)
      : (global.user = `Bearer ${result.token}`);
  } as unknown as typeof signInParams.res.json;

  return await signIn(req as unknown as ISignIn, res as unknown as Response);
};
