import { Router, Request, Response } from 'express';
import AuthValidator from '../validators/AuthValidator';
import * as AuthController from '../controllers/AuthController';
import * as Auth from '../middlewares/Auth';

const router = Router();

router.get('/ping', (req: Request, res: Response) => {
	res.json({ pong: true });
});

router.post('/user/signup', AuthValidator.signup , AuthController.signup);
router.post('/user/signin', AuthValidator.signin, AuthController.signin);

export default router;