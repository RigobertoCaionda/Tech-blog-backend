import { Request, Response } from 'express';
import Post from '../models/Post';

class UserController {
	async getPosts(req: Request, res: Response) {
		let { sort = 'asc', offset = 0, limit = 5 } = req.query;
		let { userId } = req.body;
		let total = 0;
		const totalPosts = await Post.find({ userId }).exec();
		total = totalPosts.length;

		const postData = await Post.find({ userId })
		.sort({ dateCreated: (sort == 'desc' ?-1:1) })
		.skip(offset as number)
		.limit(limit as number)
		.exec();

		res.json({ data: { postData, total } });
	}
}

export default new UserController();