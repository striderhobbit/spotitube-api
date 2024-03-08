import { Router } from 'express';
import { UserController } from '../controllers/user';

const userRouter = Router();

userRouter.get('/api/user', UserController.get);

export { userRouter };
