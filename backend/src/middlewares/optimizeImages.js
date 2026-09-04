import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import sharp from "sharp";

export async function optimizeImages(req, res, next) {
  if (!req.files) return next();

  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Garantir que a pasta existe
    await fs.mkdir(uploadDir, { recursive: true });

    const processFile = async (file) => {
      if (!file.buffer) return; // Só processa se estiver na memória

      const filename = `${Date.now()}-${crypto.randomUUID()}.webp`;
      const filepath = path.join(uploadDir, filename);

      await sharp(file.buffer)
        .webp({ quality: 80 })
        .toFile(filepath);

      // Atualiza o objeto do multer para o controlador achar o arquivo no disco
      file.filename = filename;
      file.path = filepath;
      file.mimetype = "image/webp";
      // Liberar memória
      file.buffer = null;
    };

    const promises = [];

    // req.files pode ser um array (upload.array) ou um objeto (upload.fields)
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
    console.error("Erro na otimização de imagem:", err);
    next(Object.assign(new Error("Falha ao otimizar imagem."), { statusCode: 500 }));
  }
}
