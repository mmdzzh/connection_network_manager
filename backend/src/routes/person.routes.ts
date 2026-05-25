import { Router } from 'express';
import * as controller from '../controllers/person.controller';

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.post('/:id/avatar', controller.uploadAvatarHandler);

export default router;
