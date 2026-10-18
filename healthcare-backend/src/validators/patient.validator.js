import { body, param } from 'express-validator';

const VALID_GENDERS = ['male', 'female', 'other', 'non-binary', 'prefer not to say'];

export const patientIdParam = [
  param('id')
    .isInt({ min: 1 }).withMessage('Patient ID must be a positive integer')
    .toInt(),
];

export const createPatientValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Patient name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

  body('date_of_birth')
    .trim()
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom((val) => {
      if (new Date(val) > new Date()) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),

  body('gender')
    .trim()
    .notEmpty().withMessage('Gender is required')
    .custom((val) => {
      if (!VALID_GENDERS.includes(String(val).toLowerCase())) {
        throw new Error('Gender must be Male, Female, Other, Non-binary, or Prefer not to say');
      }
      return true;
    }),

  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 30 }).withMessage('Phone must be between 5 and 30 characters'),

  body('address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),
];

export const updatePatientValidator = [
  ...patientIdParam,

  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Patient name cannot be empty')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

  body('date_of_birth')
    .optional()
    .trim()
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom((val) => {
      if (new Date(val) > new Date()) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),

  body('gender')
    .optional()
    .trim()
    .custom((val) => {
      if (!VALID_GENDERS.includes(String(val).toLowerCase())) {
        throw new Error('Gender must be Male, Female, Other, Non-binary, or Prefer not to say');
      }
      return true;
    }),

  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 30 }).withMessage('Phone must be between 5 and 30 characters'),

  body('address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),

  body().custom((value, { req }) => {
    const fields = ['name', 'date_of_birth', 'gender', 'email', 'phone', 'address'];
    const hasAnyField = fields.some((f) => req.body[f] !== undefined);
    if (!hasAnyField) {
      throw new Error('Please provide at least one field to update');
    }
    return true;
  }),
];
