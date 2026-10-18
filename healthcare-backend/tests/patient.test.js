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

describe('Patient APIs & Ownership Enforcement', () => {
  const user1 = { id: 101, email: 'user1@test.com' };
  const user2 = { id: 202, email: 'user2@test.com' };
  const token1 = jwt.sign(user1, env.jwt.secret, { expiresIn: '1h' });
  const token2 = jwt.sign(user2, env.jwt.secret, { expiresIn: '1h' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/patients');
    expect(res.status).toBe(401);
  });

  it('creates patient and enforces created_by from JWT', async () => {
    const patientData = {
      id: 1,
      name: 'John Doe',
      date_of_birth: '1990-01-01',
      gender: 'Male',
      created_by: user1.id,
    };
    db.query.mockResolvedValueOnce({ rows: [patientData] });

    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'John Doe',
        date_of_birth: '1990-01-01',
        gender: 'Male',
        created_by: 999,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.patient.id).toBe(1);
    const args = db.query.mock.calls[0][1];
    expect(args[6]).toBe(user1.id);
  });

  it('rejects invalid inputs on creation with 400', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: '', date_of_birth: '2099-01-01', gender: 'Unknown' });

    expect(res.status).toBe(400);
  });

  it('lists only patients owned by authenticated user', async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        { id: 1, name: 'Patient 1', created_by: user1.id },
        { id: 2, name: 'Patient 2', created_by: user1.id },
      ],
    });

    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE created_by = $1'), [user1.id]);
  });

  it('retrieves patient details if owned by user', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: 'Patient 1', created_by: user1.id }],
    });

    const res = await request(app)
      .get('/api/patients/1')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.patient.id).toBe(1);
  });

  it('returns 404 when user tries to retrieve another users patient', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/patients/1')
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(404);
  });

  it('updates patient successfully when owned by user', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: 'Updated Name', created_by: user1.id }],
    });

    const res = await request(app)
      .put('/api/patients/1')
      .set('Authorization', `Bearer ${token1}`)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.data.patient.name).toBe('Updated Name');
  });

  it('returns 404 when user tries to update another users patient', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put('/api/patients/1')
      .set('Authorization', `Bearer ${token2}`)
      .send({ name: 'Hacked' });

    expect(res.status).toBe(404);
  });

  it('deletes patient successfully when owned by user', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const res = await request(app)
      .delete('/api/patients/1')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
  });

  it('returns 404 when user tries to delete another users patient', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/patients/1')
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(404);
  });
});
