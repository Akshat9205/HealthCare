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

describe('Patient-Doctor Mapping APIs', () => {
  const user1 = { id: 101, email: 'user1@test.com' };
  const user2 = { id: 202, email: 'user2@test.com' };
  const token1 = jwt.sign(user1, env.jwt.secret, { expiresIn: '1h' });
  const token2 = jwt.sign(user2, env.jwt.secret, { expiresIn: '1h' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/mappings', () => {
    it('successfully assigns a doctor to a patient owned by user', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Alice Patient', created_by: user1.id }],
      });
      db.query.mockResolvedValueOnce({
        rows: [{ id: 2, name: 'Dr. House', specialization: 'Diagnostic' }],
      });
      db.query.mockResolvedValueOnce({ rows: [] });
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 10,
            patient_id: 1,
            doctor_id: 2,
            assigned_by: user1.id,
            created_at: new Date().toISOString(),
          },
        ],
      });

      const res = await request(app)
        .post('/api/mappings')
        .set('Authorization', `Bearer ${token1}`)
        .send({ patient_id: 1, doctor_id: 2 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mapping.id).toBe(10);
      expect(res.body.data.mapping.patient_name).toBe('Alice Patient');
      expect(res.body.data.mapping.doctor_name).toBe('Dr. House');
    });

    it('rejects assignment if patient does not exist or belongs to another user (404)', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/mappings')
        .set('Authorization', `Bearer ${token1}`)
        .send({ patient_id: 999, doctor_id: 2 });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Patient not found');
    });

    it('rejects assignment if doctor does not exist (404)', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Alice', created_by: user1.id }],
      });
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/mappings')
        .set('Authorization', `Bearer ${token1}`)
        .send({ patient_id: 1, doctor_id: 888 });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Doctor not found');
    });

    it('rejects duplicate assignment with 409 Conflict', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, name: 'Alice', created_by: user1.id }],
      });
      db.query.mockResolvedValueOnce({
        rows: [{ id: 2, name: 'Dr. House', specialization: 'Diagnostic' }],
      });
      db.query.mockResolvedValueOnce({ rows: [{ id: 5 }] });

      const res = await request(app)
        .post('/api/mappings')
        .set('Authorization', `Bearer ${token1}`)
        .send({ patient_id: 1, doctor_id: 2 });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Doctor is already assigned to this patient');
    });
  });

  describe('GET /api/mappings', () => {
    it('retrieves mappings for patients belonging to authenticated user', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            patient_id: 5,
            patient_name: 'Bob',
            doctor_id: 3,
            doctor_name: 'Dr. Wilson',
            assigned_by: user1.id,
          },
        ],
      });

      const res = await request(app)
        .get('/api/mappings')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data.mappings[0].patient_name).toBe('Bob');
    });
  });

  describe('GET /api/mappings/:patient_id', () => {
    it('retrieves assigned doctors for a specific patient owned by user', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 5, name: 'Bob' }],
      });
      db.query.mockResolvedValueOnce({
        rows: [
          {
            mapping_id: 1,
            doctor_id: 3,
            doctor_name: 'Dr. Wilson',
            specialization: 'Oncology',
          },
        ],
      });

      const res = await request(app)
        .get('/api/mappings/5')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.patient.name).toBe('Bob');
      expect(res.body.data.doctors).toHaveLength(1);
    });

    it('returns 404 if patient belongs to another user', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/mappings/5')
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Patient not found');
    });
  });

  describe('DELETE /api/mappings/:id', () => {
    it('deletes mapping successfully when user owns the patient', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, patient_id: 5, created_by: user1.id }],
      });
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .delete('/api/mappings/1')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects deletion if mapping belongs to another users patient with 403', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, patient_id: 5, created_by: user1.id }],
      });

      const res = await request(app)
        .delete('/api/mappings/1')
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('returns 404 if mapping does not exist', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .delete('/api/mappings/999')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(404);
    });
  });
});
