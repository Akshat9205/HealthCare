import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Verifies Bearer JWT token from Authorization header
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please provide a valid Bearer token.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwt.secret);
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' 
      ? 'Token has expired. Please login again.' 
      : 'Invalid token.';
      
    return res.status(401).json({
      success: false,
      message,
    });
  }
};

export default authenticate;
