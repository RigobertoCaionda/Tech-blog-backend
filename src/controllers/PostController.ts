import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Post from '../models/Post';
import Like from '../models/Like';
import Comment from '../models/Comment';

type filtersType = {
	status: boolean,
	title?: string
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
				postData.sort((a, b) => b.views - a.views).slice(0, 5);
				// o metodo sort pode receber uma funcao de comparacao, no nosso caso b - a esta a perguntar se b > a, quer dizer que ele vai ordenar de maior ao menor, no caso de a > b ordena na ordem inversa. o slice(0, 10) e para retornar so 10 itens
			} 

			if (cat == 'mostLiked') {
				postData.sort((a, b) => b.likes - a.likes).slice(0, 5);
			}
		}

		if (cat && q) {
			if (cat == 'mostViewed') {
				postData.sort((a, b) => b.views - a.views);
			} 

			if (cat == 'mostLiked') {
				postData.sort((a, b) => b.likes - a.likes);
			}
		}
		
		res.json({ data: { postData, total } });
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

		post.views++;
		await post.save();

		const like = await Like.findOne({ postId: post._id }).exec();

		if (like) {
			const comment = await Comment.findOne({ postId: post._id }).exec(); // Se faz parte da tabela de likes e suposto que tmbm faca da tabela de comments, sao criadas juntas
			for (let i in comment.commentedByUsers) { // Com isso agora sei se o usuario logado curtiu quais comentarios
				if (comment.commentedByUsers[i].usersLiked.includes(userId ? userId.toString() : false)) {// Quando vc quer comparar um objectId com string vc precisa transformar o objectId em string
					comment.commentedByUsers[i].liked = true;
				} else {
					comment.commentedByUsers[i].liked = false;
				}
			}

			for (let i in comment.commentedByUsers) {
				if (comment.commentedByUsers[i].idUser == userId ? userId.toString() : false) {
					comment.commentedByUsers[i].myComment = true;
				} else {
					comment.commentedByUsers[i].myComment = false;
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
					likes: post.likes
				}
			});

		} else { // E esperado que ache sempre, por isso se nao achar eu dou um erro 500 de algo deu errado
			throw Error('unexpected process');
		}
	}
}

export default new PostController();