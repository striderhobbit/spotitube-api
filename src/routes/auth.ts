import { Router } from 'express';
import { AuthController } from '../controllers/auth';

const authRouter = Router();

authRouter.post('/api/auth/lookup', AuthController.lookup);
authRouter.post('/api/auth/login', AuthController.login);

export { authRouter };

