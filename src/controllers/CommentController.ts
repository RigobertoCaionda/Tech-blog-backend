import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Comment from '../models/Comment';
import Post from '../models/Post';
import User from '../models/User';

class CommentController {
	async commentPost(req: Request, res: Response) {
		const { id } = req.params;
		const { userId, commentText } = req.body;

		if (!commentText) throw Error('data invalid');

		if (!id) throw Error('without id');
		if (!mongoose.Types.ObjectId.isValid(id)) throw Error('id invalid');

		const post = await Post.findById(id);
		if (!post) throw Error('post not found');

		const comment = await Comment.findOne({ postId: post._id }).exec();

		if (comment) {
			const user = await User.findById(userId).exec();

			comment.commentedByUsers = [
				{
					id: (Date.now() + Math.random()).toString(),
					idUser: userId,
					name: user.name,
					gender: user.gender,
					commentText,
					usersLiked: [],
					likes: 0,
					dateCreated: new Date()
				},
				...comment.commentedByUsers
			]; // Poderia usar o unshift perfeitamente tmbm

			await comment.save();

			return res.json({ data: { status: true } });
		} else {
			throw Error('unexpected process');
		}
	}
}

export default new CommentController();