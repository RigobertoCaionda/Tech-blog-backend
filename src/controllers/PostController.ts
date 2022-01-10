import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Post from '../models/Post';
import Like from '../models/Like';
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

class PostController {
	async getAll(req: Request, res: Response) {}

	async insert(req: Request, res: Response) {
		const { title, desc, subject, text, userId } = req.body;

		if (!title || !Boolean(title.trim())) throw Error('data invalid');
		if (!desc || !Boolean(desc.trim())) throw Error('data invalid');
		if (!text || text.length < 1) throw Error('data invalid');
		if (!subject || subject.length < 1) throw Error('data invalid');

		const newPost = new Post();
		newPost.title = title;
		newPost.desc = desc;
		newPost.subject = subject;
		newPost.text = text;
		newPost.likes = 0;
		newPost.views = 0;
		newPost.userId = userId;
		newPost.dateCreated = new Date();

		const info = await newPost.save();

		const newLikeData = new Like();
		newLikeData.postId = info._id;
		newLikeData.likedByUsers = [];
		await newLikeData.save();

		const newCommentData = new Comment();
		newCommentData.postId = info._id;
		newCommentData.commentedByUsers = [];
		await newCommentData.save();

		return res.json({ id: info._id });
	}

	async getPost(req: Request, res: Response) {
		const { id } = req.params;
		const { userId } = req.body;

		if (!id) throw Error('without id');
		if (!mongoose.Types.ObjectId.isValid(id)) throw Error('id invalid');

		const post = await Post.findById(id);
		if (!post) throw Error('post not found');

		post.views++;
		await post.save();

		const like = await Like.findOne({ postId: post._id }).exec();

		if (like) {
			const comment = await Comment.findOne({ postId: post._id }).exec();

			return res.status(200).json({
				data: {
					id: post._id,
					title: post.title,
					dateCreated: post.dateCreated,
					desc: post.desc,
					subject: post.subject,
					text: post.text,
					likedByUsers: like.likedByUsers,
					userLiked: userId ? like.likedByUsers.includes(userId) : false,
					commentsList: comment.commentedByUsers,
					views: post.views,
					likes: post.likes,
				},
			});
		}
	}

	async comment(req: Request, res: Response) {
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
					dateCreated: new Date(),
				},
				...comment.commentedByUsers,
			];

			await comment.save();

			return res.json({ data: { status: true } });
		}

		return res.json({ data: { error: 'Ocorreu algum erro' } });
	}

	async like(req: Request, res: Response) {
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
		}

		return res.json({ data: { error: 'Ocorreu algum erro' } });
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
						commentedByUsers: comments,
					});

					return res.json({ data: { status: true } });
				}
			}
		}

		return res.json({ data: { error: 'Ocorreu algum erro' } });
	}
}

export default new PostController();