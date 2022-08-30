import controller from "../../admin.controller";
import { faker } from "@faker-js/faker";
import { ISignIn } from "../../../utils/ts-types";
import { Response } from "express";

let req: Record<string, any>, res: Record<string, any>;

const { signIn } = controller;

beforeEach(() => {
  req = {
    body: {
      username: "johndoe",
      password: "johndoe88.",
    },
  };
  res = {
    status(status: number) {
      expect(status).toBe(200);
      return this;
    },
    json(result: any) {
      expect(typeof result.message).toBe("string");
    },
  };
});

describe("test sign in function", () => {
  test("return token when sign in with username", async () => {
    res.json = function (result: any) {
      expect(typeof result.token).toBe("string");
      expect(result.token).toBeTruthy();
    };
    await signIn(req as any as ISignIn, res as any as Response);
  });
  test("return token when sign in with email", async () => {
    req.body.username = "johndoe@gmail.com";
    res.json = function (result: any) {
      expect(typeof result.token).toBe("string");
      expect(result.token).toBeTruthy();
    };
    await signIn(req as any as ISignIn, res as any as Response);
  });
});
