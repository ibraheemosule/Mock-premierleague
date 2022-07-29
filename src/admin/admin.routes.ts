import { Router } from "express";
import { Request, Response } from "express";
import controller from "./admin.controller";

const router = Router();

router.post("/signup", controller.signUp);
router.get("/", controller.getAll);
router.delete("/:id", controller.remove);
router.get("/:id", controller.getOne);

export default router;
