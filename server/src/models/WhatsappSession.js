import mongoose from "mongoose";

const whatsappSessionSchema = new mongoose.Schema(
  {
    key:   { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

export const WhatsappSession = mongoose.model("WhatsappSession", whatsappSessionSchema);
