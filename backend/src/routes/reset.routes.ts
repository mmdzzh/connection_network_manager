import { Router } from 'express';
import * as controller from '../controllers/reset.controller';

const router = Router();
router.post('/', controller.resetData);
export default router;
