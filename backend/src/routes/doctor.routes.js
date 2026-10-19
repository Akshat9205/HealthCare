import { Router } from 'express';
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctor.controller.js';
import {
  createDoctorValidator,
  updateDoctorValidator,
  doctorIdParam,
} from '../validators/doctor.validator.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.post('/', createDoctorValidator, validate, createDoctor);
router.get('/', getDoctors);
router.get('/:id', doctorIdParam, validate, getDoctorById);
router.put('/:id', updateDoctorValidator, validate, updateDoctor);
router.delete('/:id', doctorIdParam, validate, deleteDoctor);

export default router;
