import crypto from "node:crypto";
import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";

export async function optimizeImages(req, res, next) {
  if (!req.files) return next();

  try {
    const processFile = async (file) => {
      if (!file.buffer) return;

      const webpBuffer = await sharp(file.buffer)
        .webp({ quality: 80 })
        .toBuffer();

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "divina-comedia",
            format: "webp"
          },
          (error, result) => {
            if (error) {
              console.error("Erro no Cloudinary:", error);
              return reject(error);
            }
            
            // Emula as propriedades do Multer mas salva a URL segura do Cloudinary
            file.filename = result.public_id.split('/').pop() + ".webp";
            file.path = result.secure_url; 
            file.mimetype = "image/webp";
            file.buffer = null; // Liberar memória
            resolve();
          }
        );

        uploadStream.end(webpBuffer);
      });
    };

    const promises = [];

    if (Array.isArray(req.files)) {
      for (const file of req.files) {
        promises.push(processFile(file));
      }
    } else {
      for (const key in req.files) {
        for (const file of req.files[key]) {
          promises.push(processFile(file));
        }
      }
    }

    await Promise.all(promises);
    next();
  } catch (err) {
    console.error("Erro na otimização/upload de imagem:", err);
    next(Object.assign(new Error("Falha ao processar e salvar imagem."), { statusCode: 500 }));
  }
}
