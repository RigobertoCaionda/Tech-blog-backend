import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Like from '../models/Like';
import Post from '../models/Post';
import Comment from '../models/Comment';

type commentType = {
	id: string;
	idUser: string;
	name: string;
	gender: string;
	commentText: string;
	likes: number;
	dateCreated: Date;
	usersLiked: string[];
};

class LikeController {
	async likePost(req: Request, res: Response) {
		const { id } = req.params;
		const { userId } = req.body;

		if (!id) throw Error('without id');
		if (!mongoose.Types.ObjectId.isValid(id)) throw Error('id invalid');

		const post = await Post.findById(id);
		if (!post) throw Error('post not found');

		const like = await Like.findOne({ postId: id }).exec();
		if (like) { 
			if (!like.likedByUsers.includes(userId)) {
				like.likedByUsers.push(userId);
				post.likes++;

				await like.save();
				await post.save();
			}

			return res.json({ data: { status: true } });
		} else {
			throw Error('unexpected process');
		}
	}

	async likeComment(req: Request, res: Response) {
		const { id } = req.params;
		const { commentId, userId } = req.body;

		if (!commentId) throw Error('data invalid');

		if (!id) throw Error('without id');
		if (!mongoose.Types.ObjectId.isValid(id)) throw Error('id invalid');

		const post = await Post.findById(id);
		if (!post) throw Error('post not found');

		const comment = await Comment.findOne({ postId: post._id }).exec();
		if (comment) {
			const comments: commentType[] = comment.commentedByUsers;
			const index = comments.findIndex((item) => item.id == commentId);

			if (index != -1) {
				if (!comments[index].usersLiked.includes(userId)) {
					comments[index].likes++;
					comments[index].usersLiked.push(userId);

					await comment.updateOne({
						_id: comment._id,
						commentedByUsers: comments
					});

					return res.json({ data: { status: true } });
				} else {
					throw Error('already liked');
				}

			} else {
				throw Error('id invalid');
			}

		} else {
			throw Error('unexpected process');
		}
	}	
}

export default new LikeController();