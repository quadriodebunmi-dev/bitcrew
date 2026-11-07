import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { HttpError, wrap } from '../lib/http.js';
import { isEmail } from '../lib/fields.js';
import { clearSession, requireAuth, setSession } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/limits.js';

const router = Router();
// Compared against when the email is unknown so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

const publicUser = (u) => ({ id: String(u._id), name: u.name, email: u.email });

router.post(
  '/login',
  loginLimiter,
  wrap(async (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' || !isEmail(email.trim())) {
      throw new HttpError(400, 'Enter your email and password.');
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    const ok = user ? await user.verifyPassword(password) : await bcrypt.compare(password, DUMMY_HASH);
    if (!user || !ok) throw new HttpError(401, 'Incorrect email or password.');
    user.lastLoginAt = new Date();
    await user.save();
    setSession(res, user);
    res.json({ user: publicUser(user) });
  })
);

router.post('/logout', (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

router.post(
  '/change-password',
  requireAuth,
  loginLimiter,
  wrap(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') throw new HttpError(400, 'Fill in both fields.');
    if (newPassword.length < 10) throw new HttpError(400, 'New password must be at least 10 characters.');
    if (newPassword.length > 128) throw new HttpError(400, 'New password is too long.');
    if (!(await req.user.verifyPassword(currentPassword))) throw new HttpError(400, 'Current password is incorrect.');
    req.user.passwordHash = await User.hashPassword(newPassword);
    await req.user.save();
    res.json({ ok: true });
  })
);

export default router;
