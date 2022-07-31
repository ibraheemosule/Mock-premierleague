import { Router } from "express";
import controller from "./admin.controller";

const router = Router();

router.post("/signup", controller.signUp);
router.post("/signin", controller.signIn);
router.use(controller.protect);
router.get("/", controller.getAll);
router.delete("/:id", controller.remove);
router.get("/:id", controller.getOne);

export default router;
