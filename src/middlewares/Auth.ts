import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const privateRoute = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.query.token && !req.body.token) {
		res.json({ notallowed: true });
		return;
	}

	let token = '';

	if (req.query.token) {
		token = req.query.token as string;
	}

	if (req.body.token) {
		token = req.body.token;
	}

	if (token == '') {
		res.json({ notallowed: true });
		return;
	}

	next();//Isso quer dizer que se vier um token como abc ele valida, mas sera testado no controller para saber se aquele token e realmente de alguem
}