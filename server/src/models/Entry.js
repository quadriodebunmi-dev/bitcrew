import mongoose from 'mongoose';

// Repeatable items: services, projects, programs, team, partners, gallery.
// `kind` says which collection an entry belongs to; `data` is validated against content/entities.js.
const entrySchema = new mongoose.Schema(
  {
    kind: { type: String, required: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true, minimize: false }
);
entrySchema.index({ kind: 1, order: 1 });

export const Entry = mongoose.model('Entry', entrySchema);
