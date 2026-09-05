import sanitizeHtml from "sanitize-html";
import AppError from "../utils/AppError.js";
import PinRepository from "../repositories/PinRepository.js";

const allowedMapId = /^[a-z0-9-]+$/i;

function sanitizeRichHtml(html) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "blockquote", "ul", "ol", "li", "h2", "h3", "a"
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank"
      })
    }
  });
}

function uploadUrl(req, file) {
  if (!file) return null;
  if (file.path && file.path.startsWith("http")) return file.path;
  return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
}

export class PinService {
  async getPins(mapId, summary = false) {
    const filter = mapId ? { mapId } : {};
    return PinRepository.findPins(filter, { summary });
  }

  async getPinById(id) {
    const pin = await PinRepository.findById(id);
    if (!pin) {
      throw new AppError("Pin não encontrado.", 404);
    }
    return pin;
  }

  parsePinPayload(req, currentPin = {}) {
    const { mapId, title, contentHtml, x, y, pinType, targetMapId, canto, isCuriosity, references, existingImages, newImageTitles } = req.body;
    const parsedX = Number(x);
    const parsedY = Number(y);
    const resolvedType = pinType === "portal" ? "portal" : "editorial";
    let parsedCanto = null;
    const parsedIsCuriosity = isCuriosity === 'true' || isCuriosity === true;

    if (canto !== undefined && canto !== null && canto !== "") {
      parsedCanto = Number(canto);
      if (!Number.isInteger(parsedCanto) || parsedCanto < 0 || parsedCanto > 100) {
        throw new AppError("Canto deve ser um número entre 0 e 100.", 400);
      }
    }

    if (!mapId || !allowedMapId.test(mapId)) {
      throw new AppError("Mapa inválido.", 400);
    }

    if (!title || title.trim().length < 2) {
      throw new AppError("Título obrigatório.", 400);
    }

    if (!Number.isFinite(parsedX) || !Number.isFinite(parsedY)) {
      throw new AppError("Coordenadas inválidas.", 400);
    }

    if (resolvedType === "portal" && (!targetMapId || !allowedMapId.test(targetMapId))) {
      throw new AppError("Portal precisa de mapa de destino.", 400);
    }

    let parsedReferences = [];
    if (references) {
      try {
        parsedReferences = JSON.parse(references);
        if (!Array.isArray(parsedReferences)) parsedReferences = [];
      } catch {
        parsedReferences = [];
      }
    }

    let parsedExistingImages = [];
    if (existingImages) {
      try {
        parsedExistingImages = JSON.parse(existingImages);
        if (!Array.isArray(parsedExistingImages)) parsedExistingImages = [];
      } catch {
        parsedExistingImages = [];
      }
    }

    let parsedNewImageTitles = [];
    if (newImageTitles) {
      try {
        parsedNewImageTitles = JSON.parse(newImageTitles);
        if (!Array.isArray(parsedNewImageTitles)) parsedNewImageTitles = [];
      } catch {
        parsedNewImageTitles = [];
      }
    }

    const newImageFiles = req.files?.images || [];
    const newGalleryImages = newImageFiles.map((file, i) => ({
      url: uploadUrl(req, file),
      title: parsedNewImageTitles[i] || ""
    })).filter(img => img.url);

    const combinedGallery = [...parsedExistingImages, ...newGalleryImages];

    const imageFile = req.files?.image?.[0];
    const pinFile = req.files?.pinImage?.[0];

    return {
      mapId,
      title: title.trim(),
      pinType: resolvedType,
      targetMapId: resolvedType === "portal" ? targetMapId.trim() : null,
      contentHtml: resolvedType === "editorial" ? sanitizeRichHtml(contentHtml || "") : "",
      canto: parsedCanto,
      isCuriosity: parsedIsCuriosity,
      references: parsedReferences,
      x: parsedX,
      y: parsedY,
      gallery: combinedGallery,
      imageUrl: uploadUrl(req, imageFile) || currentPin.imageUrl || null,
      pinImageUrl: uploadUrl(req, pinFile) || currentPin.pinImageUrl || null
    };
  }

  async createPin(req) {
    const payload = this.parsePinPayload(req);

    const existingPin = await PinRepository.findPins({ title: payload.title, mapId: payload.mapId });
    if (existingPin && existingPin.length > 0) {
      throw new AppError("Já existe um Pin com esse título neste mapa.", 400);
    }

    return PinRepository.create(payload);
  }

  async updatePin(id, req) {
    const existingPin = await PinRepository.findById(id);
    if (!existingPin) {
      throw new AppError("Pin não encontrado.", 404);
    }
    const payload = this.parsePinPayload(req, existingPin);

    const duplicatePin = await PinRepository.findPins({ title: payload.title, mapId: payload.mapId });
    if (duplicatePin && duplicatePin.length > 0 && duplicatePin[0]._id.toString() !== id) {
      throw new AppError("Já existe um Pin com esse título neste mapa.", 400);
    }

    return PinRepository.update(id, payload);
  }

  async deletePin(id) {
    const deleted = await PinRepository.delete(id);
    if (!deleted) {
      throw new AppError("Pin não encontrado.", 404);
    }
    return { id };
  }
}

export default new PinService();
