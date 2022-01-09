import { Router, Request, Response } from 'express';
import AuthValidator from '../validators/AuthValidator';
import * as AuthController from '../controllers/AuthController';
import * as PostController from '../controllers/PostController';
import * as Auth from '../middlewares/Auth';

const router = Router();

router.get('/ping', (req: Request, res: Response) => {
	res.json({ pong: true });
});

router.post('/user/signup', AuthValidator.signup , AuthController.signup);
router.post('/user/signin', AuthValidator.signin, AuthController.signin);
router.get('/blog', PostController.getAll);
router.post('/blog/add', Auth.privateRoute , PostController.insert);
router.get('/blog/:id', PostController.getPost);
router.put('/blog/:id/like', Auth.privateRoute, PostController.like);
router.put('/blog/:id/comment', Auth.privateRoute, PostController.comment);
router.put('/blog/:id/likeComment', Auth.privateRoute, PostController.likeComment);

export default router;