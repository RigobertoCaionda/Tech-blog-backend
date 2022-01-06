import { Router, Request, Response } from 'express';
import AuthValidator from '../validators/AuthValidator';
import * as AuthController from '../controllers/AuthController';

const router = Router();

router.get('/ping', (req: Request, res: Response) => {
	res.json({ pong: true });
});

router.post('/user/signup', AuthValidator.signup , AuthController.signup);

export default router;