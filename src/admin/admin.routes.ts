import { Router } from "express";
import controller from "./admin.controller";

const router = Router();

router.post("/signup", controller.signUp);
router.post("/signin", controller.signIn);
router.use(controller.protect);
router.get("/", controller.getAll);
router
  .route("/:id")
  .delete(controller.remove)
  .get(controller.getOne)
  .patch(controller.update);

export default router;
