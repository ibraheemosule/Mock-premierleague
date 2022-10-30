import controller from "../../admin.controller";
import { ISignIn } from "../../../utils/ts-types";
import { Response } from "express";
import { testSignIn } from "src/utils/test-utils";

let req: ISignIn, res: Response;

const { signIn } = controller;

export default describe("sign in tests", () => {
  beforeEach(() => {
    req = {
      body: {
        username: "johndoe",
        password: "johndoe88.",
      },
    } as unknown as ISignIn;
    res = {
      status(status: number) {
        expect(status).toBe(200);
        return this;
      },
      json(result: any) {
        expect(typeof result.message).toBe("string");
      },
    } as unknown as Response;
  });

  describe("test sign in function", () => {
    test("return token when sign in with username", async () => {
      res.json = function (result: any) {
        expect(typeof result.token).toBe("string");
      } as unknown as typeof res.json;

      await testSignIn({ signIn, req, res });
    });

    test("return token when sign in with email", async () => {
      req.body.username = "johndoe@gmail.com";

      res.json = function (result: { [key: string]: string }) {
        expect(typeof result.token).toBe("string");
        expect(result.token).toBeTruthy();
      } as unknown as typeof res.json;

      await testSignIn({ signIn, req, res });
    });
  });
});
