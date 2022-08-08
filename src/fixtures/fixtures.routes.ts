import { Router } from "express";
import controller from "./fixtures.controller";
import { protect, verifyAdmin } from "../utils/controllers/authController";

const router = Router();

router.get("/", controller.getOne);
router.get("/link/:linkId", controller.retrieveLink);
router.use(protect);
router.get("/", controller.getAll);

router.use(verifyAdmin);
router.post("/", controller.add);
router.post("/generate-link", controller.link);
router
  .route("/:id")
  .get(controller.userFixtures)
  .delete(controller.remove)
  .patch(controller.update);
router.delete("/link/:id", controller.remove);

export default router;
