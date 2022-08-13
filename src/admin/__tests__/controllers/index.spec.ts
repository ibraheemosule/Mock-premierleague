import controller from "../../admin.controller";
import { isFunction } from "lodash";

const controllerNames = [
  "getOne",
  "getAll",
  "signIn",
  "signUp",
  "remove",
  "update",
  "protect",
];

describe("contain all controllers for admin", () => {
  test("contain controller names", () => {
    controllerNames.forEach((name: string) => {
      const func = controller[name as keyof typeof controller];
      expect(func).toBeTruthy();
    });
  });

  test("sign up controller is a function", () => {
    expect(isFunction(controller.signUp)).toBeTruthy();
  });
});
