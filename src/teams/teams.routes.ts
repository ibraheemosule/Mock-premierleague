import { Router } from "express";
import controller from "./teams.controller";
import { protect } from "../utils/controllers/authController";

const router = Router();

router.use(protect);
router.route("/").get(controller.getAll).post(controller.add);
router.route("/:id").get(controller.getOne).delete(controller.remove);

export default router;
