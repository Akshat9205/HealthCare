import { body, param } from 'express-validator';

export const doctorIdParam = [
  param('id')
    .isInt({ min: 1 }).withMessage('Doctor ID must be a positive integer')
    .toInt(),
];

export const createDoctorValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Doctor name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

  body('specialization')
    .trim()
    .notEmpty().withMessage('Specialization is required')
    .isLength({ min: 2, max: 100 }).withMessage('Specialization must be 2-100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 30 }).withMessage('Phone must be 5-30 characters'),

  body('qualification')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Qualification cannot exceed 100 characters'),
];

export const updateDoctorValidator = [
  ...doctorIdParam,

  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Doctor name cannot be empty')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

  body('specialization')
    .optional()
    .trim()
    .notEmpty().withMessage('Specialization cannot be empty')
    .isLength({ min: 2, max: 100 }).withMessage('Specialization must be 2-100 characters'),

  body('email')
    .optional()
    .trim()
    .notEmpty().withMessage('Email cannot be empty')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 30 }).withMessage('Phone must be 5-30 characters'),

  body('qualification')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Qualification cannot exceed 100 characters'),

  body().custom((value, { req }) => {
    const fields = ['name', 'specialization', 'email', 'phone', 'qualification'];
    const hasAnyField = fields.some((f) => req.body[f] !== undefined);
    if (!hasAnyField) {
      throw new Error('Please provide at least one field to update');
    }
    return true;
  }),
];
