import { User } from "./user.model";
import { crudControllers } from "../utils/controllers/crudControllers";
import { authControllers, protect } from "../utils/controllers/authController";

export default {
  ...crudControllers(User),
  ...authControllers(User),
  protect,
};
