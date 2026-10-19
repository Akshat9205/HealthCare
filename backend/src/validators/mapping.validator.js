import { body, param } from 'express-validator';

export const mappingIdParam = [
  param('id')
    .isInt({ min: 1 }).withMessage('Mapping ID must be a positive integer')
    .toInt(),
];

export const patientIdParam = [
  param('patient_id')
    .isInt({ min: 1 }).withMessage('Patient ID must be a positive integer')
    .toInt(),
];

export const createMappingValidator = [
  body('patient_id')
    .notEmpty().withMessage('patient_id is required')
    .isInt({ min: 1 }).withMessage('patient_id must be a positive integer')
    .toInt(),

  body('doctor_id')
    .notEmpty().withMessage('doctor_id is required')
    .isInt({ min: 1 }).withMessage('doctor_id must be a positive integer')
    .toInt(),
];
