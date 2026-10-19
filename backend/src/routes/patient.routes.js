import { Router } from 'express';
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from '../controllers/patient.controller.js';
import {
  createPatientValidator,
  updatePatientValidator,
  patientIdParam,
} from '../validators/patient.validator.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.post('/', createPatientValidator, validate, createPatient);
router.get('/', getPatients);
router.get('/:id', patientIdParam, validate, getPatientById);
router.put('/:id', updatePatientValidator, validate, updatePatient);
router.delete('/:id', patientIdParam, validate, deletePatient);

export default router;
