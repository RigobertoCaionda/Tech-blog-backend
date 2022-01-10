import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

type TokenPayload = {
	id: string;
};

export const loginRequired = async (req: Request, res: Response, next: NextFunction) => {
	const { authorization } = req.headers;
	if (!authorization) throw Error('token is necessary');// Essa forma de if

	const [, token] = authorization.split(' ');// Essa forma de ignorar a primeira propriedade
	if (!token) throw Error('token is necessary');//Token, como vem afinal isso daqui

	const { id } = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;// Daqui sai o id do user entao?

	const user = await User.findById(id);
	if (!user) throw Error('user not found');

	req.body.userId = id;
	next();
}

export const loginOptional = async (req: Request, res: Response, next: NextFunction) => {
	const { authorization } = req.headers;

	if (authorization) {
		const [, token] = authorization.split(' ');
		if (token) {
			const { id } = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
			const user = await User.findById(id);
			if (user) {
				req.body.userId = user._id;// Pq nao passar o id tmbm assim como no de cima?
			}
		}
	}
	next();
}