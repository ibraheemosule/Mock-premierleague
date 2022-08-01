import { Router } from "express";
import controller from "./teams.controller";
import { protect, verifyAdmin } from "../utils/controllers/authController";

const router = Router();

router.get("/", controller.getOne);
router.use(protect);
router.get("/", controller.getAll);

router.use(verifyAdmin);
router.post("/", controller.add);
router.route("/:id").delete(controller.remove).patch(controller.update);

export default router;
