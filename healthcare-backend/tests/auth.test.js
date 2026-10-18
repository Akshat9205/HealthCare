import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import * as db from '../src/config/db.js';
import { env } from '../src/config/env.js';

vi.mock('../src/config/db.js', () => {
  const mockQuery = vi.fn();
  const mockTestConnection = vi.fn().mockResolvedValue(true);
  const mockClosePool = vi.fn().mockResolvedValue();
  return {
    query: mockQuery,
    testConnection: mockTestConnection,
    closePool: mockClosePool,
    pool: { query: mockQuery, on: vi.fn(), end: mockClosePool },
    default: { query: mockQuery, testConnection: mockTestConnection, closePool: mockClosePool },
  };
});

describe('Authentication APIs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('registers user and returns safe details', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            name: 'Dr. Jane Smith',
            email: 'jane@hospital.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Dr. Jane Smith',
          email: 'jane@hospital.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(1);
      expect(res.body.data.user.email).toBe('jane@hospital.com');
      expect(res.body.data.user.password_hash).toBeUndefined();
    });

    it('rejects duplicate email with 409', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 10 }] });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Dr. Duplicate',
          email: 'jane@hospital.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('rejects invalid inputs with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'invalid-email',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in successfully and returns JWT', async () => {
      const hash = await bcrypt.hash('Correct123!', 10);
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Dr. Jane', email: 'jane@hospital.com', password_hash: hash }],
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@hospital.com', password: 'Correct123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();

      const decoded = jwt.verify(res.body.data.token, env.jwt.secret);
      expect(decoded.id).toBe(1);
    });

    it('rejects invalid password with 401', async () => {
      const hash = await bcrypt.hash('RealPassword123!', 10);
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, email: 'jane@hospital.com', password_hash: hash }],
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@hospital.com', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects non-existent email with 401', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@hospital.com', password: 'AnyPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Token Protection', () => {
    it('rejects missing token with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('rejects invalid token with 401', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });
});
