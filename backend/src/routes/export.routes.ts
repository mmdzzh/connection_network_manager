import { Router } from 'express';
import * as controller from '../controllers/export.controller';

const router = Router();
router.get('/', controller.exportData);
export default router;
