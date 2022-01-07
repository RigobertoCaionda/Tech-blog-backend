import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { validationResult, matchedData } from 'express-validator';
import User from '../models/User';

export const signup = async (req: Request, res: Response) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.json({ error: errors.mapped() });
		return;
	}

	const data = matchedData(req);

	if (data.password !== data.confirmPassword) {
		res.json({data: { error: 'Senhas não batem!' } });
		return;
	}

	const user = await User.findOne({ email: data.email });

	if (user) {
		res.json({ data: { error: 'Email já existe!' } });
		return;
	}

	const passwordHash = await bcrypt.hash(data.password, 10);
	const payload = (Date.now() + Math.random()).toString();
	const token = await bcrypt.hash(payload, 10);

	const newUser = new User({
		name: data.name,
		email: data.email,
		gender: data.gender,
		password: passwordHash,
		token
	});
	await newUser.save();
	res.json({ data: { token } });
}

export const signin = async (req: Request, res: Response) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.json({ error: errors.mapped() });
		return;
	}

	const data = matchedData(req);

	const user = await User.findOne({ email: data.email });

	if (!user) {
		 res.json({ data: { error: 'E-mail e/ou senha errados!' } });
         return;
	}

	const match = await bcrypt.compare(data.password, user.password);

	if (!match) {
		 res.json({error: 'E-mail e/ou senha errados!'});
         return;
	}

	const payload = (Date.now() + Math.random()).toString();
	const token = await bcrypt.hash(payload, 10);

	user.token = token;
	await user.save();

	res.json({ data: { token, email: data.email } });
}