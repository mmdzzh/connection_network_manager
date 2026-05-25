import { Router } from 'express';
import * as controller from '../controllers/import.controller';

const router = Router();
router.post('/', controller.importData);
export default router;
