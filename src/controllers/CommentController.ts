import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Comment from '../models/Comment';
import Post from '../models/Post';
import User from '../models/User';

type ItemType = {
	id: string,
	idUser: string,
	name: string,
	gender: string,
	commentText: string,
	usersLiked: string[],
	likes: number,
	dateCreated: Date,
	liked: boolean,
	myComment: boolean,
	image: string
}

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

	async editComment(req: Request, res: Response) {
		const { id } = req.params;
		let { commentId, userId, commentText } = req.body;

		if (!commentId) throw Error('data invalid');
		if (!id) throw Error('without id');
		if (!mongoose.Types.ObjectId.isValid(id)) throw Error('id invalid');
		if (!commentText) throw Error('data invalid');

		const post = await Post.findById(id);
		if (!post) throw Error('post not found');

		const comment = await Comment.findOne({ postId: post._id }).exec();

		if (comment) {
			let newCommentedByUsers = comment.commentedByUsers;

			let index = newCommentedByUsers.findIndex((item: ItemType) => item.id == commentId);
			if (index !== -1) {
				if (comment.commentedByUsers[index].idUser == userId) {
					newCommentedByUsers[index].commentText = commentText;

					await comment.updateOne({
									_id: comment._id,
									commentedByUsers: newCommentedByUsers
							});

					res.json({ data: { status: true } });
				} else {
					throw Error('unauthorized comment');
				}
			} else {
				throw Error('invalid commentId');
			}

			await comment.save();
		} else {
			throw Error('unexpected process');
		}
	}

	async delete(req: Request, res: Response) {
		const { id } = req.params;
		let { commentId, userId } = req.body;

		if (!commentId) throw Error('data invalid');
		if (!id) throw Error('without id');
		if (!mongoose.Types.ObjectId.isValid(id)) throw Error('id invalid');

		const post = await Post.findById(id);
		if (!post) throw Error('post not found');

		const comment = await Comment.findOne({ postId: post._id }).exec();

		let newCommentedByUsers = comment.commentedByUsers;
		const index = newCommentedByUsers.findIndex((item: ItemType) => item.id == commentId);

		if (index !== -1) {
			if (newCommentedByUsers[index].idUser == userId) {
				newCommentedByUsers.splice(index, 1);

				comment.commentedByUsers = newCommentedByUsers;

				await comment.save();

				res.json({ data: { status: true } });
			} else {
				throw Error('unauthorized comment');
			}
			
		} else {
			throw Error('invalid commentId');
		}
	}
}

export default new CommentController();