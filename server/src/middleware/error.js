import { config } from '../config.js';

export function notFound(req, res) {
  res.status(404).json({ error: `No API route for ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let status = err.status || 500;
  let message = err.message;

  if (err.code === 'LIMIT_FILE_SIZE') [status, message] = [413, 'That image is larger than 8 MB.'];
  else if (err.name === 'CastError') [status, message] = [400, 'Invalid id.'];
  else if (err.name === 'ValidationError') status = 400;
  else if (err.type === 'entity.parse.failed') [status, message] = [400, 'Invalid JSON.'];
  else if (err.type === 'entity.too.large') [status, message] = [413, 'Request is too large.'];
  else if (err.http_code) [status, message] = [502, `Image service error: ${err.message}`];

  if (status >= 500) {
    console.error('[error]', err);
    if (config.isProd) message = 'Something went wrong on our side.';
  }
  res.status(status).json({ error: message });
}
