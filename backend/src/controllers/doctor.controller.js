import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createDoctor = asyncHandler(async (req, res) => {
  const { name, specialization, email, phone, qualification } = req.body;
  const userId = req.user.id;
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await query(
    'SELECT id FROM doctors WHERE LOWER(email) = $1 LIMIT 1',
    [normalizedEmail]
  );

  if (existing.rows.length > 0) {
    return res.status(409).json({
      success: false,
      message: 'A doctor with this email already exists',
    });
  }

  const result = await query(
    `INSERT INTO doctors (name, specialization, email, phone, qualification, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, specialization, email, phone, qualification, created_by, created_at, updated_at`,
    [
      name.trim(),
      specialization.trim(),
      normalizedEmail,
      phone ? phone.trim() : null,
      qualification ? qualification.trim() : null,
      userId,
    ]
  );

  res.status(201).json({
    success: true,
    message: 'Doctor created successfully',
    data: { doctor: result.rows[0] },
  });
});

export const getDoctors = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT id, name, specialization, email, phone, qualification, created_by, created_at, updated_at
     FROM doctors
     ORDER BY created_at DESC`
  );

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: { doctors: result.rows },
  });
});

export const getDoctorById = asyncHandler(async (req, res) => {
  const doctorId = parseInt(req.params.id, 10);

  const result = await query(
    `SELECT id, name, specialization, email, phone, qualification, created_by, created_at, updated_at
     FROM doctors
     WHERE id = $1`,
    [doctorId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found',
    });
  }

  res.status(200).json({
    success: true,
    data: { doctor: result.rows[0] },
  });
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const doctorId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  const existingResult = await query(
    'SELECT id, created_by FROM doctors WHERE id = $1',
    [doctorId]
  );

  if (existingResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found',
    });
  }

  const doctor = existingResult.rows[0];

  if (doctor.created_by !== userId) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to update this doctor',
    });
  }

  if (req.body.email) {
    const checkEmail = await query(
      'SELECT id FROM doctors WHERE LOWER(email) = $1 AND id != $2 LIMIT 1',
      [req.body.email.trim().toLowerCase(), doctorId]
    );

    if (checkEmail.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A doctor with this email already exists',
      });
    }
  }

  const allowedFields = ['name', 'specialization', 'email', 'phone', 'qualification'];
  const setClauses = [];
  const params = [];
  let index = 1;

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      let val = req.body[field];
      if (typeof val === 'string') {
        val = val.trim();
        if (field === 'email') val = val.toLowerCase();
      }
      setClauses.push(`${field} = $${index}`);
      params.push(val);
      index++;
    }
  }

  if (setClauses.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No fields provided for update',
    });
  }

  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  params.push(doctorId);

  const updateQuery = `
    UPDATE doctors
    SET ${setClauses.join(', ')}
    WHERE id = $${index}
    RETURNING id, name, specialization, email, phone, qualification, created_by, created_at, updated_at
  `;

  const result = await query(updateQuery, params);

  res.status(200).json({
    success: true,
    message: 'Doctor updated successfully',
    data: { doctor: result.rows[0] },
  });
});

export const deleteDoctor = asyncHandler(async (req, res) => {
  const doctorId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  const existingResult = await query(
    'SELECT id, created_by FROM doctors WHERE id = $1',
    [doctorId]
  );

  if (existingResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found',
    });
  }

  const doctor = existingResult.rows[0];

  if (doctor.created_by !== userId) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to delete this doctor',
    });
  }

  await query('DELETE FROM doctors WHERE id = $1', [doctorId]);

  res.status(200).json({
    success: true,
    message: 'Doctor deleted successfully',
  });
});
