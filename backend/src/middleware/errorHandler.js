import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON body sent in request';
  }

  if (err.code === '23505') {
    statusCode = 409;
    message = 'A record with this detail already exists';
  }

  if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced record does not exist';
  }

  if (statusCode >= 500) {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

export default errorHandler;
