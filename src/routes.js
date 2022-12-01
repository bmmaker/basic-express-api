import { Router } from 'express';
import { uploadRouter } from './midlewares/upload.js';
import { usersRouter } from './components/users/users.route.js';
import { itemsRouter } from './items.js';

const router = Router();

// 라우터 객체 등록
router.use('/users', usersRouter);
router.use('/items', itemsRouter);
router.use('/upload', uploadRouter);

export { router };
