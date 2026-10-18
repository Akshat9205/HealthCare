import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  // Check if email already registered
  const existing = await query(
    'SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1',
    [normalizedEmail]
  );

  if (existing.rows.length > 0) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists',
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Save new user
  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at, updated_at`,
    [name.trim(), normalizedEmail, passwordHash]
  );

  const user = result.rows[0];

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user },
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  // Lookup user
  const result = await query(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE LOWER(email) = $1 LIMIT 1',
    [normalizedEmail]
  );

  const user = result.rows[0];

  // Generic message for security so we don't leak user existence
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    },
  });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1',
    [req.user.id]
  );

  const user = result.rows[0];
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});
