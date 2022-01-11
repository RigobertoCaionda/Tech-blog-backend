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
		const { title, desc, subject, text, userId } = req.body;// O userId vem la do Auth.ts

		if (!title || !Boolean(title.trim())) throw Error('data invalid');// Boolean('') retorna false e Boolean('a') retorna true
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

		//Salvando o registro na tabela de likes tmbm
		const newLikeData = new Like();
		newLikeData.postId = info._id;
		newLikeData.likedByUsers = [];
		await newLikeData.save();

		//Salvando o registro na tabela de comments tmbm
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
			const comment = await Comment.findOne({ postId: post._id }).exec(); // Se faz parte da tabela de likes e suposto que tmbm faca da tabela de comments, sao criadas juntas
			for (let i in comment.commentedByUsers) { // Com isso agora sei se o usuario logado curtiu quais comentarios
				if (comment.commentedByUsers[i].usersLiked.includes(userId.toString())) {// Quando vc quer comparar um objectId com string vc precisa transformar o objectId em string
					comment.commentedByUsers[i].liked = true;
				} else {
					comment.commentedByUsers[i].liked = false;
				}
			}
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
				}
			});

		} else { // E esperado que ache sempre, por isso se nao achar eu dou um erro 500 de algo deu errado
			throw Error('unexpected process');
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

export default new PostController();