import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createMapping = asyncHandler(async (req, res) => {
  const { patient_id, doctor_id } = req.body;
  const userId = req.user.id;

  const patientResult = await query(
    'SELECT id, name, created_by FROM patients WHERE id = $1',
    [patient_id]
  );

  if (patientResult.rows.length === 0 || patientResult.rows[0].created_by !== userId) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  const doctorResult = await query(
    'SELECT id, name, specialization FROM doctors WHERE id = $1',
    [doctor_id]
  );

  if (doctorResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found',
    });
  }

  const existingMapping = await query(
    'SELECT id FROM patient_doctor_mappings WHERE patient_id = $1 AND doctor_id = $2',
    [patient_id, doctor_id]
  );

  if (existingMapping.rows.length > 0) {
    return res.status(409).json({
      success: false,
      message: 'Doctor is already assigned to this patient',
    });
  }

  const insertResult = await query(
    `INSERT INTO patient_doctor_mappings (patient_id, doctor_id, assigned_by)
     VALUES ($1, $2, $3)
     RETURNING id, patient_id, doctor_id, assigned_by, created_at`,
    [patient_id, doctor_id, userId]
  );

  const mapping = insertResult.rows[0];
  const patient = patientResult.rows[0];
  const doctor = doctorResult.rows[0];

  res.status(201).json({
    success: true,
    message: 'Doctor assigned to patient successfully',
    data: {
      mapping: {
        id: mapping.id,
        patient_id: mapping.patient_id,
        patient_name: patient.name,
        doctor_id: mapping.doctor_id,
        doctor_name: doctor.name,
        doctor_specialization: doctor.specialization,
        assigned_by: mapping.assigned_by,
        created_at: mapping.created_at,
      },
    },
  });
});

export const getMappings = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await query(
    `SELECT m.id, m.patient_id, p.name AS patient_name,
            m.doctor_id, d.name AS doctor_name, d.specialization AS doctor_specialization,
            m.assigned_by, m.created_at
     FROM patient_doctor_mappings m
     INNER JOIN patients p ON p.id = m.patient_id
     INNER JOIN doctors d ON d.id = m.doctor_id
     WHERE p.created_by = $1
     ORDER BY m.created_at DESC`,
    [userId]
  );

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: { mappings: result.rows },
  });
});

export const getMappingsByPatientId = asyncHandler(async (req, res) => {
  const patientId = parseInt(req.params.patient_id, 10);
  const userId = req.user.id;

  const patientResult = await query(
    'SELECT id, name FROM patients WHERE id = $1 AND created_by = $2',
    [patientId, userId]
  );

  if (patientResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found',
    });
  }

  const patient = patientResult.rows[0];

  const result = await query(
    `SELECT m.id AS mapping_id, d.id AS doctor_id, d.name AS doctor_name,
            d.specialization, d.email, d.phone, d.qualification, m.created_at AS assigned_at
     FROM patient_doctor_mappings m
     INNER JOIN doctors d ON d.id = m.doctor_id
     WHERE m.patient_id = $1
     ORDER BY m.created_at DESC`,
    [patientId]
  );

  res.status(200).json({
    success: true,
    patient: {
      id: patient.id,
      name: patient.name,
    },
    count: result.rows.length,
    data: { doctors: result.rows },
  });
});

export const deleteMapping = asyncHandler(async (req, res) => {
  const mappingId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  const checkResult = await query(
    `SELECT m.id, m.patient_id, p.created_by
     FROM patient_doctor_mappings m
     INNER JOIN patients p ON p.id = m.patient_id
     WHERE m.id = $1`,
    [mappingId]
  );

  if (checkResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Mapping not found',
    });
  }

  if (checkResult.rows[0].created_by !== userId) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to delete this mapping',
    });
  }

  await query('DELETE FROM patient_doctor_mappings WHERE id = $1', [mappingId]);

  res.status(200).json({
    success: true,
    message: 'Patient-doctor assignment removed successfully',
  });
});
