import Pin from "../models/Pin.js";

export class PinRepository {
  async findPins(filter, options = {}) {
    let query = Pin.find(filter).sort({ createdAt: -1 });
    
    if (options.summary) {
      query = query.select("_id title mapId canto x y pinType targetMapId isCuriosity pinImageUrl");
    }

    return query.lean();
  }

  async findById(id) {
    return Pin.findById(id);
  }

  async create(data) {
    return Pin.create(data);
  }

  async update(id, data) {
    const pin = await Pin.findById(id);
    if (!pin) return null;

    pin.set(data);
    await pin.save();
    return pin;
  }

  async delete(id) {
    return Pin.findByIdAndDelete(id);
  }
}

export default new PinRepository();
