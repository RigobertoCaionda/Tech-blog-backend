import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
const { v4: uuid } = require('uuid');
const jimp = require('jimp');
import { unlink } from 'fs/promises';
import Post from '../models/Post';
import User from '../models/User';
import { validationResult, matchedData } from 'express-validator';

type UpdateType = {
	name?: string,
	email?: string,
	gender?: string,
	password?: string,
	image?: string,
	status?: boolean
}

class UserController {
	async getPosts(req: Request, res: Response) {
		let { sort = 'asc', offset = 0, limit = 5 } = req.query;
		let { userId } = req.body;
		let total = 0;
		const user = await User.findById(userId);
		const totalPosts = await Post.find({ userId }).exec();
		total = totalPosts.length;

		const postData = await Post.find({ userId })
		.sort({ dateCreated: (sort == 'desc' ?-1:1) })
		.skip(offset as number)
		.limit(limit as number)
		.exec();

		res.json({ data: { postData, total, idUser: user._id } });
	}

	async getUserInfo (req: Request, res: Response) {
		const { userId } = req.body;
		const user = await User.findById(userId);
		res.json({ data: user });
	}

	async edit(req: Request, res: Response) {
		const { name, email, gender, password, confirmPassword, knownPassWord, userId } = req.body;

		const addImage = async (buffer: any) => {
			let newName = `${uuid()}.jpg`;
			let tmpImg = await jimp.read(buffer);
			tmpImg.cover(150, 150).quality(80).write(`./public/media/${newName}`);
			return newName;
		}

		let updates: UpdateType = {};

		if (name) {
			updates.name = name;
		}

		if (email) {
			if (knownPassWord) {
				const user =  await User.findById(userId); // Se esta logado e pq userId pertence a um user

				const passwordIsValid = await bcrypt.compare(knownPassWord, user.password);

				if (!passwordIsValid) throw Error('invalid password');

			const emailCheck = await User.findOne({ email }).exec();

				if (emailCheck) throw Error('email already in use');

				updates.email = email;	
			} else {
				throw Error('knownPassWord invalid');
			}
		}

		if (gender) {
			updates.gender = gender;
		}

		if (password) {
			if (knownPassWord) {

				const user = await User.findById(userId);
				const passwordIsValid = await bcrypt.compare(knownPassWord, user.password);
				if (!passwordIsValid) throw Error('invalid password');

				if (confirmPassword) {
					if (password === confirmPassword) {
						const hash = await bcrypt.hash(password, 10);
						updates.password = hash;
					} else {
						throw Error('confirm password invalid');
					}
				} else {
					throw Error('confirm password invalid');
				}
			} else {
				throw Error('knownPassWord invalid');
			}
		}

		if (req.files && req.files.img) {
				if (['image/jpeg', 'image/jpg', 'image/png'].includes((req.files.img as any).mimetype)) {
					let url = await addImage((req.files.img as any).data);
					const user =  await User.findById(userId);
					if(user.image !== 'default.jpg') await unlink(`./public/media/${user.image}`);
					updates.image = url;
				} else {
					throw Error('invalid file');
				}
		}

		await User.findOneAndUpdate({ _id: userId }, { $set: updates });

		res.json({ data: { status: true } });
	}

	async delete(req: Request, res: Response) {
		const { userId } = req.body;
		const user =  await User.findById(userId);
		
		if(user.image !== 'default.jpg') await unlink(`./public/media/${user.image}`);
		await User.findByIdAndRemove(userId);

		res.json({ data: { status: true } });
	}
}

export default new UserController();