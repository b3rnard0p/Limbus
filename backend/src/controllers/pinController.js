import PinService from "../services/PinService.js";

export async function listPins(req, res, next) {
  try {
    const mapId = req.query.mapId;
    const summary = req.query.summary === "true";
    const pins = await PinService.getPins(mapId, summary);
    return res.json({ data: pins });
  } catch (err) {
    next(err);
  }
}

export async function getPin(req, res, next) {
  try {
    const pin = await PinService.getPinById(req.params.id);
    return res.json({ data: pin });
  } catch (err) {
    next(err);
  }
}

export async function createPin(req, res, next) {
  try {
    const pin = await PinService.createPin(req);
    return res.status(201).json({ data: pin });
  } catch (err) {
    next(err);
  }
}

export async function updatePin(req, res, next) {
  try {
    const pin = await PinService.updatePin(req.params.id, req);
    return res.json({ data: pin });
  } catch (err) {
    next(err);
  }
}

export async function deletePin(req, res, next) {
  try {
    const data = await PinService.deletePin(req.params.id);
    return res.json({ data });
  } catch (err) {
    next(err);
  }
}
