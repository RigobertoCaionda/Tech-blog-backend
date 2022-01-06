import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { validationResult, matchedData } from 'express-validator';

export const signup = async (req: Request, res: Response) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.json({ error: errors.mapped() });
		return;
	}

	const data = matchedData(req);

	res.json({data: 'oi'});
}