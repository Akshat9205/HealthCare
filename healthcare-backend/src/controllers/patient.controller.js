import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createPatient = asyncHandler(async (req, res) => {
  const { name, date_of_birth, gender, email, phone, address } = req.body;
  const userId = req.user.id;

  const insertQuery = `
    INSERT INTO patients (name, date_of_birth, gender, email, phone, address, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, name, date_of_birth, gender, email, phone, address, created_by, created_at, updated_at
  `;

  const values = [
    name.trim(),
    date_of_birth,
    gender.trim(),
    email ? email.trim().toLowerCase() : null,
    phone ? phone.trim() : null,
    address ? address.trim() : null,
    userId,
  ];

  const result = await query(insertQuery, values);

  res.status(201).json({
    success: true,
    message: 'Patient created successfully',
    data: { patient: result.rows[0] },
  });
});

export const getPatients = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await query(
    `SELECT id, name, date_of_birth, gender, email, phone, address, created_by, created_at, updated_at
     FROM patients
     WHERE created_by = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: { patients: result.rows },
  });
});

export const getPatientById = asyncHandler(async (req, res) => {
  const patientId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  const result = await query(
    `SELECT id, name, date_of_birth, gender, email, phone, address, created_by, created_at, updated_at
     FROM patients
     WHERE id = $1 AND created_by = $2`,
    [patientId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  res.status(200).json({
    success: true,
    data: { patient: result.rows[0] },
  });
});

export const updatePatient = asyncHandler(async (req, res) => {
  const patientId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  const updatable = ['name', 'date_of_birth', 'gender', 'email', 'phone', 'address'];
  const setClauses = [];
  const params = [];
  let index = 1;

  for (const field of updatable) {
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
  params.push(patientId, userId);

  const updateQuery = `
    UPDATE patients
    SET ${setClauses.join(', ')}
    WHERE id = $${index} AND created_by = $${index + 1}
    RETURNING id, name, date_of_birth, gender, email, phone, address, created_by, created_at, updated_at
  `;

  const result = await query(updateQuery, params);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Patient updated successfully',
    data: { patient: result.rows[0] },
  });
});

export const deletePatient = asyncHandler(async (req, res) => {
  const patientId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  const result = await query(
    'DELETE FROM patients WHERE id = $1 AND created_by = $2 RETURNING id',
    [patientId, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Patient deleted successfully',
  });
});
