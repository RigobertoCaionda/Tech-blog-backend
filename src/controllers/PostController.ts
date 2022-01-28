import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Post from '../models/Post';
import Like from '../models/Like';
import Comment from '../models/Comment';
import User from '../models/User';

type filtersType = {
	status: boolean,
	title?: string
};

type UpdateType = {
	title?: string,
	desc?: string,
	subject?: string[],
	text?: string[]
};

class PostController {
	async getAll(req: Request, res: Response) {
		let { sort = 'asc', offset = 0, limit = 5, q, cat} = req.query;
		let filters: filtersType = { status: true };
		let total = 0;

		if (q) {
			filters.title = {'$regex': q, '$options': 'i'} as any;
		}

		const totalPosts = await Post.find(filters).exec();// Resultados sem paginacao
		total = totalPosts.length;

		const postData = await Post.find(filters)
		.sort({ dateCreated: (sort == 'desc' ?-1:1) })
		.skip(offset as number)
		.limit(limit as number)
		.exec(); // Resultados com paginacao

		if (cat && !q) {
			if (cat == 'mostViewed') {
				let totMostViewed = totalPosts.sort((a, b) => b.views - a.views).slice(0, 5); // Se nao tiver q, ele deve retornar tudo e chamar os 5 mais vistos
				// o metodo sort pode receber uma funcao de comparacao
				return res.json({ data: { postData: totMostViewed, total: 1 } });
			} 

			if (cat == 'mostLiked') {
				let totMostLiked = totalPosts.sort((a, b) => b.likes - a.likes).slice(0, 5);
				return res.json({ data: { postData: totMostLiked, total: 1 } });
			}
		}

		if (cat && q) {
			if (cat == 'mostViewed') postData.sort((a, b) => b.views - a.views);
			if (cat == 'mostLiked') postData.sort((a, b) => b.likes - a.likes);
		}

		return res.json({ data: { postData, total } });
	}

	async insert(req: Request, res: Response) {
		const { title, desc, subject, text, userId } = req.body;// O userId vem la do Auth.ts

		if (!title || !Boolean(title.trim())) throw Error('data invalid');// Boolean('') retorna false e Boolean('a') retorna true
		if (!desc || !Boolean(desc.trim())) throw Error('data invalid');
		if (!text || text.length < 1) throw Error('data invalid');
		if (!subject || subject.length < 1) throw Error('data invalid');

		const newPost = new Post();
		newPost.status = true;
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

		const totalPosts = await Post.find({ status: true }).exec(); //retornar todos os posts para mostrar proximo e anterior

		let prevNextArray = [];
		let index = totalPosts.findIndex((item) => item._id == id);
		if (index !== -1) {
			if (totalPosts[index + 1] === undefined) {
				prevNextArray.push(totalPosts[0]);
			} else {
				prevNextArray.push(totalPosts[index + 1]);
			}

			if (totalPosts[index - 1] === undefined) {
				prevNextArray.push(totalPosts[totalPosts.length - 1]);
			} else {
				prevNextArray.push(totalPosts[index - 1]);
			}

		} else {
			throw Error('unexpected process');
		}

		post.views++;
		await post.save();

		const like = await Like.findOne({ postId: post._id }).exec();

		if (like) {
			const comment = await Comment.findOne({ postId: post._id }).exec(); // Se faz parte da tabela de likes e suposto que tmbm faca da tabela de comments, sao criadas juntas
			const user = await User.findById(post.userId);
			let userData  = { name: '', image: '' };
			if (user) {
				userData.name = user.name;
				userData.image = `${process.env.BASE}/file/${user.image}`;
			} else {// Se ele criou o post e depois deletou a conta
				userData.name = 'Usuário do Blog';
				userData.image = `${process.env.BASE}/file/default.jpg`;
			}

			for (let i in comment.commentedByUsers) {
				if (comment.commentedByUsers[i].usersLiked.includes(userId ? userId.toString() : false)) {// Quando vc quer comparar um objectId com string vc precisa transformar o objectId em string
					comment.commentedByUsers[i].liked = true;
				} else {
					comment.commentedByUsers[i].liked = false;
				}

				if (comment.commentedByUsers[i].idUser == userId ? userId.toString() : false) {
					comment.commentedByUsers[i].myComment = true;
				} else {
					comment.commentedByUsers[i].myComment = false;
				}

				const user = await User.findById(comment.commentedByUsers[i].idUser);
					if (user && user.image) {
						comment.commentedByUsers[i].image = `${process.env.BASE}/file/${user.image}`;
					} else { 
						comment.commentedByUsers[i].image = `${process.env.BASE}/file/default.jpg`;
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
					totalComments: comment.commentedByUsers.length,
					views: post.views,
					likes: post.likes,
					userData,
					prevNextArray
				}
			});

		} else { 
			throw Error('unexpected process');
		}
	}

	async editPost(req: Request, res: Response) {
		const { title, desc, subject, text, userId } = req.body;
		const { id } = req.params;

		if (!id) throw Error('without id');
		if (!mongoose.Types.ObjectId.isValid(id)) throw Error('id invalid');

		const post = await Post.findById(id);
		if (!post) throw Error('post not found');
		if (post.userId !== userId) throw Error('unauthorized post');

		let updates: UpdateType = {};

		if (title && title.trim() !== '') updates.title = title;
		if (desc && desc.trim() !== '') updates.desc = desc;
		if (text && text.length > 0) updates.text = text;
		if (subject && subject.length > 0) updates.subject = subject;

		if (title && title.trim() == '') throw Error('data invalid');
		if (desc && desc.trim() == '') throw Error('data invalid');
		if (text && text.length < 1) throw Error('data invalid');
		if (subject && subject.length < 1) throw Error('data invalid');

		await Post.findOneAndUpdate({ _id: id }, { $set: updates });

		res.json({ data: { status: true } });
	}

	async delete(req: Request, res: Response) {
		let { id } = req.params;
		let { userId } = req.body;

		if (!id) throw Error('without id');
		if (!mongoose.Types.ObjectId.isValid(id)) throw Error('id invalid');

		const post = await Post.findById(id);
		if (!post) throw Error('post not found');
		if (post.userId !== userId) throw Error('unauthorized post');

		const comment = await Comment.findOne({ postId: id }).exec();
		const like = await Like.findOne({ postId: id }).exec();
		if (!comment || !like) throw Error('unexpected process');

		await Comment.findByIdAndRemove(comment._id);
		await Like.findByIdAndRemove(like._id);
		await Post.findByIdAndRemove(id);

		res.json({ data: { status: true } });
	}

	async search(req: Request, res: Response) {
		let { sort = 'asc', offset = 0, limit = 5, subject } = req.query;
		let total = 0;

		if (!subject) throw Error('data invalid');

		const totalPosts = await Post.find({ subject }).exec();
		total = totalPosts.length;

		const postData = await Post.find({ subject })
		.sort({ dateCreated: (sort == 'desc' ?-1:1) })
		.skip(offset as number)
		.limit(limit as number)
		.exec();

		res.json({ data: { postData, total } });
	}
}

export default new PostController();