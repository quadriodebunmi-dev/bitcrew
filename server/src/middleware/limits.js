import rateLimit from 'express-rate-limit';

const make = (windowMinutes, limit, error) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error },
  });

export const apiLimiter = make(15, 600, 'Too many requests. Please slow down.');
export const loginLimiter = make(15, 10, 'Too many sign-in attempts. Try again in 15 minutes.');
export const formLimiter = make(15, 8, 'You have sent several messages recently. Please try again later.');
export const uploadLimiter = make(15, 120, 'Too many uploads. Try again shortly.');
