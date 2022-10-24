import controller from "../../admin.controller";
import { faker } from "@faker-js/faker";
import { isFunction } from "lodash";
import { Request, Response } from "express";

let req: Request, res: Response;

const { signUp } = controller;

export default describe("sign up tests", () => {
  beforeEach(() => {
    req = {
      body: {
        name: "John Doe",
        username: "johndoe88",
        email: faker.internet.email(),
        password: "johndoe88.",
      },
    } as unknown as Request;
    res = {
      status(status: number) {
        expect(status).toBe(400);
        return this;
      },
      json(result: any) {
        expect(typeof result.message).toBe("string");
      },
    } as unknown as Response;
  });

  describe("test sign up details", () => {
    test("sign up controller is a function", () => {
      expect(isFunction(signUp)).toBeTruthy();
    });

    describe("invalid body details should return 400 error", () => {
      test("no name in signup body object should return 400 error", async () => {
        expect.assertions(2);

        req.body = { ...req.body, name: undefined };

        res = {
          ...res,
          status(status: number) {
            expect(status).toBe(400);
            return this;
          },
          json(result: { [key: string]: string }) {
            expect(result.message).toBe("name is required");
          },
        } as unknown as Response;

        await signUp(req, res);
      });

      test("no username in signup body object should return 400 error", async () => {
        req.body = { ...req.body, username: undefined };

        res = {
          ...res,
          json(result: { [key: string]: string }) {
            expect(result.message).toBe("username is required");
          },
        } as unknown as Response;
        await signUp(req, res);
      });

      test("no email in signup body object should return 400 error", async () => {
        req.body = { ...req.body, email: undefined };

        res = {
          ...res,
          json(result: { [key: string]: string }) {
            expect(result.message).toBe("email is required");
          },
        } as unknown as Response;
        await signUp(req, res);
      });

      test("no password in signup body object should return 400 error", async () => {
        req.body = { ...req.body, password: undefined };

        res = {
          ...res,
          json(result: { [key: string]: string }) {
            expect(result.message).toBe("password is required");
          },
        } as unknown as Response;
        await signUp(req, res);
      });
    });

    test("name character syntax should be valid", async () => {
      expect.assertions(2);

      req.body.name = faker.internet.userName();
      res = {
        ...res,
        status(code: number) {
          expect(code).toBe(400);
          return this;
        },
        json(result: any) {
          expect(result.name).toBe("name should be letters and spaces only");
        },
      } as unknown as Response;

      await signUp(req, res);
    });

    test("username should not contain spaces", async () => {
      req.body.username = "hello there";
      res.json = function (result: any) {
        expect(typeof result.username).toBe("string");
      } as typeof res.json;
      await signUp(req, res);
    });

    test("username should not have special characters except _", async () => {
      req.body.username = "hello.there";
      res.json = function (result: any) {
        expect(typeof result.username).toBe("string");
      } as typeof res.json;
      await signUp(req, res);
    });

    test("username should not have only numbers", async () => {
      req.body.username = "854908943";
      res.json = function (result: any) {
        expect(typeof result.username).toBe("string");
      } as typeof res.json;
      await signUp(req, res);
    });

    test("create a new admin with valid details", async () => {
      const removeDot = () => {
        req.body.username = faker.internet.userName();
        if (req.body.username.includes(".")) removeDot();
      };

      removeDot();

      res = {
        ...res,
        status(status: number) {
          expect(status).toBe(200);
          return this;
        },
      } as unknown as Response;

      res.json = function (response: any) {
        expect(typeof response).toBe("object");
        expect(response).toMatchObject({
          token: expect.any(String),
        });
      } as typeof res.json;
      await signUp(req, res);
    });

    test("can signup with letters only username", async () => {
      req.body.username = "johndoe";
      req.body.email = "johndoe@gmail.com";

      res = {
        status(status: number) {
          expect(status).toBe(200);
          return this;
        },
      } as unknown as Response;

      res.json = function (response: any) {
        expect(typeof response).toBe("object");
        expect(response).toMatchObject({
          token: expect.any(String),
        });
      } as typeof res.json;

      await signUp(req, res);
    });
  });
});
