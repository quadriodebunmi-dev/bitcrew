import mongoose from 'mongoose';

// One document per editable page section, e.g. key = "home.hero".
// Only sections an editor has saved exist here; everything else falls back to defaults.
const contentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);

export const Content = mongoose.model('Content', contentSchema);
