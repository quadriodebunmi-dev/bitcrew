import mongoose from 'mongoose';

export const SUBMISSION_TYPES = ['contact', 'service', 'partnership', 'community'];
export const SUBMISSION_STATUSES = ['new', 'read', 'archived'];

const submissionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: SUBMISSION_TYPES, default: 'contact', index: true },
    status: { type: String, enum: SUBMISSION_STATUSES, default: 'new', index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 40, default: '' },
    organisation: { type: String, trim: true, maxlength: 160, default: '' },
    subject: { type: String, trim: true, maxlength: 160, default: '' },
    skill: { type: String, trim: true, maxlength: 120, default: '' },
    message: { type: String, trim: true, maxlength: 4000, default: '' },
  },
  { timestamps: true }
);
submissionSchema.index({ createdAt: -1 });

export const Submission = mongoose.model('Submission', submissionSchema);
