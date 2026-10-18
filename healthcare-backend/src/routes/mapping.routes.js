import { Router } from 'express';
import {
  createMapping,
  getMappings,
  getMappingsByPatientId,
  deleteMapping,
} from '../controllers/mapping.controller.js';
import {
  createMappingValidator,
  mappingIdParam,
  patientIdParam,
} from '../validators/mapping.validator.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.post('/', createMappingValidator, validate, createMapping);
router.get('/', getMappings);
router.get('/:patient_id', patientIdParam, validate, getMappingsByPatientId);
router.delete('/:id', mappingIdParam, validate, deleteMapping);

export default router;
