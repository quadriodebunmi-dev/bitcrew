import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Admin', trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Records without a usable hash (e.g. from an older project) simply fail to log in, never crash.
userSchema.methods.verifyPassword = function verifyPassword(plain) {
  if (typeof plain !== 'string' || typeof this.passwordHash !== 'string' || !this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(plain, this.passwordHash);
};
userSchema.statics.hashPassword = (plain) => bcrypt.hash(plain, 12);

// Own collection name so it can never collide with a pre-existing "users" collection in the same database.
export const User = mongoose.model('User', userSchema, 'admin_users');
