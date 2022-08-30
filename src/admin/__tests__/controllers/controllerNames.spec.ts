import controller from "../../admin.controller";
import { isFunction } from "lodash";

export default describe("contain all controllers for admin", () => {
  const controllerNames = [
    "getOne",
    "getAll",
    "signIn",
    "signUp",
    "remove",
    "update",
    "protect",
  ];

  test("contain controller names", async () => {
    await controllerNames.forEach((name: string) => {
      const func: any = controller[name as keyof typeof controller];
      expect(isFunction(func)).toBeTruthy();
    });
  });
});
