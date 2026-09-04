import mongoose from "mongoose";

const pinSchema = new mongoose.Schema(
  {
    mapId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    pinType: {
      type: String,
      enum: ["editorial", "portal"],
      default: "editorial"
    },
    targetMapId: {
      type: String,
      default: null
    },
    canto: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    isCuriosity: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140
    },
    contentHtml: {
      type: String,
      default: "",
      maxlength: 25000
    },
    imageUrl: {
      type: String,
      default: null
    },
    imageUrls: {
      type: [String],
      default: []
    },
    gallery: {
      type: [
        {
          title: String,
          url: String
        }
      ],
      default: []
    },
    references: {
      type: [
        {
          title: String,
          url: String
        }
      ],
      default: []
    },
    pinImageUrl: {
      type: String,
      default: null
    },
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

pinSchema.index({ mapId: 1, x: 1, y: 1 });

export default mongoose.model("Pin", pinSchema);
