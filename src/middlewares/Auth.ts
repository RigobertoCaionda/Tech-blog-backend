import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

type TokenPayload = {
	id: string;
};

export const loginRequired = async (req: Request, res: Response, next: NextFunction) => {
	const { authorization } = req.headers;
	if (!authorization) throw Error('token is necessary');

	const [, token] = authorization.split(' ');
	if (!token) throw Error('token is necessary');

	const { id } = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;// Retorna aqui o id do user que esta logado, caso o jwt.verify consiga verificar esse token

	const user = await User.findById(id);
	if (!user) throw Error('user not found');// Se vc apagar um user, apesar disso o token dele ainda sera valido, por isso isso aqui, pode ser que o token existe, mas o user nao

	req.body.userId = id;// Passando o id do usuario que esta logado ao corpo da requisicao, caso ele ache um user e consiga verificar o token no verify
	next();
}

export const loginOptional = async (req: Request, res: Response, next: NextFunction) => {// O loginOptional e para aquelas rotas que nao sao obrigadas a ter login, mas se tiver e usado
	const { authorization } = req.headers;

	if (authorization) {
		const [, token] = authorization.split(' ');
		if (token) {
			try {// Esse try catch vai evitar que essa funcao caia no errorHandler ao tentar verificar um token invalido, com try catch, se der erro ja nao vai ser olhado como erro pois ja estou tratando
			const { id } = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
			const user = await User.findById(id);
			if (user) {
				req.body.userId = user._id;// Passar o user._id ou so id como na linha 21, e igual
			}
		} catch(e) {}
		}
	}
	next();
}