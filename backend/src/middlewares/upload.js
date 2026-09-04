import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";

const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Apenas imagens PNG, JPG e WEBP sao permitidas."));
    }

    return cb(null, true);
  }
});
