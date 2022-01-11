import { Router, Request, Response } from 'express';
import AuthValidator from '../validators/AuthValidator';
import AuthController from '../controllers/AuthController';
import PostController from '../controllers/PostController';
import * as Auth from '../middlewares/Auth';

const router = Router();

router.get('/ping', (req: Request, res: Response) => {
	res.json({ pong: true });
});

router.post('/user/signup', AuthValidator.signup , AuthController.signup);
router.post('/user/signin', AuthValidator.signin, AuthController.signin);

router.get('/blog', PostController.getAll);
router.get('/blog/:id', Auth.loginOptional, PostController.getPost);
router.post('/blog/add', Auth.loginRequired , PostController.insert);
router.put('/blog/:id/like', Auth.loginRequired, PostController.like);
router.put('/blog/:id/comment', Auth.loginRequired, PostController.comment);
router.put('/blog/:id/likeComment', Auth.loginRequired, PostController.likeComment);

export default router;