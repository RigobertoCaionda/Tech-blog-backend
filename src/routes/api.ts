import { Router, Request, Response } from 'express';
import AuthValidator from '../validators/AuthValidator';
import AuthController from '../controllers/AuthController';
import PostController from '../controllers/PostController';
import CommentController from '../controllers/CommentController';
import LikeController from '../controllers/LikeController';
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
router.put('/blog/:id/like', Auth.loginRequired, LikeController.likePost);
router.put('/blog/:id/comment', Auth.loginRequired, CommentController.commentPost);
router.put('/blog/:id/likeComment', Auth.loginRequired, LikeController.likeComment);

export default router;