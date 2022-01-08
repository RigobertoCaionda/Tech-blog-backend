import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Post from '../models/Post';
import Like from '../models/Like';

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
					likedByUsers: post.likedByUsers,
					userLiked,
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
					likedByUsers: post.likedByUsers,
					userLiked: false,
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