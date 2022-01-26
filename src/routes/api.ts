import { Router, Request, Response } from 'express';
import UserValidator from '../validators/UserValidator';
import AuthController from '../controllers/AuthController';
import PostController from '../controllers/PostController';
import UserController from '../controllers/UserController';
import CommentController from '../controllers/CommentController';
import LikeController from '../controllers/LikeController';
import * as Auth from '../middlewares/Auth';

const router = Router();

router.get('/ping', (req: Request, res: Response) => {
	res.json({ pong: true });
});

router.post('/user/signup', AuthController.signup);
router.post('/user/signin', AuthController.signin);

router.get('/blog', PostController.getAll);
router.get('/blog/search', PostController.search);
router.get('/blog/:id', Auth.loginOptional, PostController.getPost);
router.get('/user/posts', Auth.loginRequired, UserController.getPosts);
router.post('/blog/add', Auth.loginRequired , PostController.insert);
router.post('/user/editProfile', UserValidator.editProfile, Auth.loginRequired, UserController.edit);
router.put('/blog/:id', Auth.loginRequired, PostController.editPost);
router.put('/blog/:id/like', Auth.loginRequired, LikeController.likePost);
router.put('/blog/:id/comment', Auth.loginRequired, CommentController.commentPost);
router.put('/blog/:id/likeComment', Auth.loginRequired, LikeController.likeComment);
router.put('/blog/:id/editComment', Auth.loginRequired, CommentController.editComment);
router.delete('/blog/:id', Auth.loginRequired, PostController.delete);
router.delete('/blog/:id/comment', Auth.loginRequired, CommentController.delete);
router.delete('/user/deleteProfile', Auth.loginRequired, UserController.delete);

export default router;