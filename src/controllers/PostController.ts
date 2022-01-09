import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Post from '../models/Post';
import Like from '../models/Like';
import Comment from '../models/Comment';

type commentType = {
	id: string,
	idUser: string,
	name: string,
	gender: string,
	commentText: string,
	likes: number,
	dateCreated: Date,
	usersCommented: string[]
}

export const getAll = async () => {

}

export const insert = async (req: Request, res: Response) => {
	let { title, desc, subject, text, token } = req.body;

	const user = await User.findOne({ token }).exec();

	if (!title || title.trim() === '') {
		res.json({ data: { error: 'Titulo não pode ser vazio' } });
		return;
	}

	if (!desc || desc.trim() === '') {
		res.json({ data: { error: 'Descrição não pode ser vazia' } });
		return;
	}

	if (!subject || subject.length === 0) {
		res.json({ data: { error: 'Assunto não pode ser vazia' } });
		return;
	}

	if (!text || text.length === 0) {
		res.json({ data: { error: 'Parágrafos não podem estar vazios' } });
		return;
	}

	const newPost = new Post();
	newPost.title = title;
	newPost.desc = desc;
	newPost.subject = subject;
	newPost.text = text;
	newPost.likes = 0;
	newPost.views = 0;
	newPost.userId = user._id;//Nao preciso confirmar se user.id existe pq se o user chegou aqui eu ja confio que ele tem token valido, senao seria parado pelo Auth.privateRoute
	newPost.dateCreated = new Date();

	const info = await newPost.save();

	//Salvando o registro na tabela de likes
	const newLikeData = new Like();
	newLikeData.postId = info._id;
	newLikeData.likedByUsers = [];
	await newLikeData.save();

	//Salvando o registro na tabela de comentarios
	const newCommentData = new Comment();
	newCommentData.postId = info._id;
	newCommentData.commentedByUsers = [];
	await newCommentData.save();

	res.json({ id: info._id });
}

export const getPost = async (req: Request, res: Response) => {
	let { id } = req.params;
	let { token } = req.query;//Se tiver token, ai sim eu verifico se esse user curtiu o post

	if (!id) {
		res.json({ data: { error: 'Nenhum post selecionado' } });
		return;
	}

	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.json({ data: { error: 'ID inválido' } });
		return;
	}

	const post = await Post.findById(id);

	if (!post) {
		res.json({ data: { error: 'Post iniexistente' } });
		return;
	}

	post.views++;
	await post.save();

	const like = await Like.findOne({ postId: post._id }).exec();

	if (like) {//E suposto que sempre ache uma correspondencia na tabela like, por isso nao tem else
		const user = await User.findOne({ token }).exec();
		const comment = await Comment.findOne({ postId: post._id }).exec();//Nao necessariamente fica aqui, pode ficar fora
		if (user) {
			let userLiked: boolean = false;
			if (like.likedByUsers.includes(user._id)) {
				userLiked = true;
			}

			res.json({ 
				data: {
					id: post._id,
					title: post.title,
					dateCreated: post.dateCreated,
					desc: post.desc,
					subject: post.subject,
					text: post.text,
					likedByUsers: like.likedByUsers,
					userLiked,
					commentsList: comment.commentedByUsers,
					views: post.views,
					likes: post.likes
				}
			 });
			return;
		} else {
			res.json({ 
				data: {
					id: post._id,
					title: post.title,
					dateCreated: post.dateCreated,
					desc: post.desc,
					subject: post.subject,
					text: post.text,
					likedByUsers: like.likedByUsers,
					userLiked: false,
					commentsList: comment.commentedByUsers,
					views: post.views,
					likes: post.likes
				}
			 });
			return;	
		}
	}
}

export const like = async (req: Request, res: Response) => {
	let { id } = req.params;
	let { token } = req.body;

	if (!id) {
		res.json({ data: {error: 'Nenhum post selecionado' } });
		return;
	}

	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.json({ data: { error: 'ID inválido' } });
		return;
	}

	const post = await Post.findById(id);

	if (!post) {
		res.json({ data: { error: 'Post iniexistente' } });
		return;
	}

	const like = await Like.findOne({ postId: post._id }).exec();// E suposto que sempre ache algum item aqui

	if (like) {
		const user = await User.findOne({ token }).exec();

		if (!like.likedByUsers.includes(user._id)) {
			like.likedByUsers.push(user._id);
			post.likes++;
			//Salvando o like
			await like.save();
			//Salvando o post
			await post.save();
		}

		res.json({ data: { status: true } });
		return;
	}

	res.json({ data: { error: 'Ocorreu algum erro' } });
}

export const comment = async (req: Request, res: Response) => {
	let { id } = req.params;
	let { token, commentText } = req.body;

	if (!commentText || commentText == '') {
		res.json({ data: { error: 'Escreva algum comentário' } });
		return;
	}

	if (!id) {
		res.json({ data: {error: 'Nenhum post selecionado' } });
		return;
	}

	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.json({ data: { error: 'ID inválido' } });
		return;
	}

	const post = await Post.findById(id);

	if (!post) {
		res.json({ data: { error: 'Post iniexistente' } });
		return;
	}

	const comment = await Comment.findOne({ postId: post._id }).exec();// Sempre vai achar um pq quando um post e criado o seu id vai para a tabela de likes e comments

	if (comment) {
		const user = await User.findOne({ token }).exec();

		comment.commentedByUsers.unshift({
			id: (Date.now() + Math.random()).toString(),
			idUser: user._id,
			name: user.name,
			gender: user.gender,
			commentText,
			usersCommented: [],
			likes: 0,
			dateCreated: new Date()
		});
		await comment.save();

		res.json({ data: { status: true } });
		return;
	}

	res.json({ data: { error: 'Ocorreu algum erro' } });	

}

export const likeComment = async (req: Request, res: Response) => {
	let { id } = req.params;
	let { token, commentId } = req.body;

	if (!commentId) {
		res.json({ data: {error: 'ID do objeto de comentário não enviado' } });
		return;
	}

	if (!id) {
		res.json({ data: {error: 'Nenhum post selecionado' } });
		return;
	}

	if (!mongoose.Types.ObjectId.isValid(id)) {
		res.json({ data: { error: 'ID inválido' } });
		return;
	}

	const post = await Post.findById(id);

	if (!post) {
		res.json({ data: { error: 'Post inexistente' } });
		return;
	}

	const comment = await Comment.findOne({ postId: post._id }).exec();

	if (comment) {
			let comments: commentType[] = comment.commentedByUsers;
			let commentIndex = 0;
			let selectedComment = comments.filter((item, index) => {
				if (item.id == commentId) {
					commentIndex = index;
					return item;
				} else {
					return false;
				}
			});

			const user = await User.findOne({ token }).exec();

			if (selectedComment.length > 0) {
				if(!comments[commentIndex].usersCommented.includes(user._id)) {
					comments[commentIndex].likes++;
					comments[commentIndex].usersCommented.push(user._id);
					comment.commentedByUsers = comments;//So aceita com parentesis o comments
					await comment.save();
					res.json({ data: { status: true } });
					return;
			}
		} else {
			console.log('Veio no else')
			res.json({ data: { error: 'ID de comentário inválido' } });
			return;
		}

			res.json({ data: { error: 'Ocorreu algum erro' } });
	}

}