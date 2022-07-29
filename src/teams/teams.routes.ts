import { Router } from "express";
import controller from "./teams.controller";

const router = Router();

router.route("/").get(controller.getAll).post(controller.add);

router.route("/:id").delete(controller.remove);

export default router;
