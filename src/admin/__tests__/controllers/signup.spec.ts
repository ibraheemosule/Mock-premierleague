import controller from "../../admin.controller";
import { faker } from "@faker-js/faker";
import { isFunction } from "lodash";

let req: Record<string, any>, res: Record<string, any>;

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
    };
    res = {
      status(status: number) {
        expect(status).toBe(400);
        return this;
      },
      json(result: any) {
        expect(typeof result.message).toBe("string");
      },
    };
  });

  describe("test sign up details", () => {
    test("sign up controller is a function", () => {
      expect(isFunction(signUp)).toBeTruthy();
    });

    test("invalid body details should return 400 error", async () => {
      expect.assertions(2);
      req = { body: {} };
      await signUp(req, res);
    });

    test("name character syntax should be valid", async () => {
      req.body.name = faker.internet.userName();
      res.json = function (result: any) {
        expect(typeof result.name).toBe("string");
      };
      await signUp(req, res);
    });

    test("username should not contain spaces", async () => {
      req.body.username = "hello there";
      res.json = function (result: any) {
        expect(typeof result.username).toBe("string");
      };
      await signUp(req, res);
    });

    test("username should not have special characters except _", async () => {
      req.body.username = "hello.there";
      res.json = function (result: any) {
        expect(typeof result.username).toBe("string");
      };
      await signUp(req, res);
    });

    test("username should not have only numbers", async () => {
      req.body.username = "854908943";
      res.json = function (result: any) {
        expect(typeof result.username).toBe("string");
      };
      await signUp(req, res);
    });

    test("create a new admin with valid details", async () => {
      const removeDot = () => {
        req.body.username = faker.internet.userName();
        if (req.body.username.includes(".")) removeDot();
      };

      removeDot();

      console.log(req.body, "80");

      res = {
        status(status: number) {
          expect(status).toBe(200);
          return this;
        },

        json(response: any) {
          expect(typeof response).toBe("object");
          expect(response).toMatchObject({
            token: expect.any(String),
          });
        },
      };
      await signUp(req, res);
    });

    test("can signup with letters only username", async () => {
      req.body.username = "johndoe";
      req.body.email = "johndoe@gmail.com";
      console.log(req.body, "103");

      res = {
        status(status: number) {
          expect(status).toBe(200);
          return this;
        },

        json(response: any) {
          expect(typeof response).toBe("object");
          expect(response).toMatchObject({
            token: expect.any(String),
          });
        },
      };

      await signUp(req, res);
    });
  });
});
