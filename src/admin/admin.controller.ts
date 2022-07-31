import { Admin } from "./admin.model";
import { crudControllers } from "../utils/controllers/crudControllers";
import { authControllers, protect } from "../utils/controllers/authController";

export default {
  ...crudControllers(Admin),
  ...authControllers(Admin),
  protect,
};
