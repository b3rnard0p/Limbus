import { Router } from "express";
import {
  createPin,
  deletePin,
  listPins,
  getPin,
  updatePin
} from "../controllers/pinController.js";
import { requireAuth } from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { upload } from "../middlewares/upload.js";
import { optimizeImages } from "../middlewares/optimizeImages.js";

const router = Router();
const pinUploads = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "pinImage", maxCount: 1 }
]);

router.get("/", asyncHandler(listPins));
router.get("/:id", asyncHandler(getPin));
router.post("/", requireAuth, pinUploads, asyncHandler(optimizeImages), asyncHandler(createPin));
router.put("/:id", requireAuth, pinUploads, asyncHandler(optimizeImages), asyncHandler(updatePin));
router.delete("/:id", requireAuth, asyncHandler(deletePin));

export default router;
