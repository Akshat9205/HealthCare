import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
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

describe('Doctor Management APIs', () => {
  const creatorUser = { id: 101, email: 'creator@hospital.com' };
  const otherUser = { id: 202, email: 'other@hospital.com' };
  const creatorToken = jwt.sign(creatorUser, env.jwt.secret, { expiresIn: '1h' });
  const otherToken = jwt.sign(otherUser, env.jwt.secret, { expiresIn: '1h' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/doctors', () => {
    it('creates doctor with created_by from JWT token', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            name: 'Dr. Gregory House',
            specialization: 'Diagnostic Medicine',
            email: 'house@princeton.org',
            created_by: creatorUser.id,
          },
        ],
      });

      const res = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          name: 'Dr. Gregory House',
          specialization: 'Diagnostic Medicine',
          email: 'house@princeton.org',
          created_by: 9999,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.doctor.id).toBe(1);
      const args = db.query.mock.calls[1][1];
      expect(args[5]).toBe(creatorUser.id);
    });

    it('rejects duplicate doctor email with 409', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 10 }] });

      const res = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          name: 'Dr. Duplicate',
          specialization: 'Cardiology',
          email: 'house@princeton.org',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('rejects invalid fields with 400', async () => {
      const res = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ name: '', specialization: '', email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/doctors (Shared Directory)', () => {
    it('allows any authenticated user to view the full doctor directory', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          { id: 1, name: 'Dr. House', specialization: 'Diagnostic' },
          { id: 2, name: 'Dr. Wilson', specialization: 'Oncology' },
        ],
      });

      const res = await request(app)
        .get('/api/doctors')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.data.doctors).toHaveLength(2);
    });

    it('retrieves single doctor details for any authenticated user', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Dr. House', specialization: 'Diagnostic' }],
      });

      const res = await request(app)
        .get('/api/doctors/1')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.doctor.id).toBe(1);
    });

    it('returns 404 if doctor does not exist', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/doctors/999')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/doctors/:id (Permissions)', () => {
    it('allows doctor creator to update details', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, created_by: creatorUser.id }],
      });
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Dr. House Updated', created_by: creatorUser.id }],
      });

      const res = await request(app)
        .put('/api/doctors/1')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ name: 'Dr. House Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.doctor.name).toBe('Dr. House Updated');
    });

    it('rejects modification by non-creator with 403 Forbidden', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, created_by: creatorUser.id }],
      });

      const res = await request(app)
        .put('/api/doctors/1')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Unauthorized Change' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/doctors/:id (Permissions)', () => {
    it('allows doctor creator to delete doctor', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, created_by: creatorUser.id }],
      });
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .delete('/api/doctors/1')
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects deletion by non-creator with 403 Forbidden', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, created_by: creatorUser.id }],
      });

      const res = await request(app)
        .delete('/api/doctors/1')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
