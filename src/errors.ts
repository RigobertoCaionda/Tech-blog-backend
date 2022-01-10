import { ErrorRequestHandler } from 'express';//E o tipo do erro
import { JsonWebTokenError } from 'jsonwebtoken';// Para lidar com erros do jsonwebtoken

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	if (err instanceof JsonWebTokenError) {
		return res.status(400).json({ error: 'this token is not valid' });
	}

	switch(err.message) {
		case 'token is necessary':
			return res.status(402).json({ error: 'token é necessario' });

		case 'without id':
			return res.status(402).json({ error: 'Id é necessario' });

		case 'id invalid':
			return res.status(402).json({ error: 'Esse id é invalido' });

		case 'post not found':
			return res.status(402).json({ error: 'Esse post não existe' });

		case 'data invalid':
			return res.status(402).json({ error: 'Request body invalido' });

		case 'email already in use':
			return res.status(400).json({ error: 'Email já exists' });

		case 'password invalid':
			return res.status(400).json({ error: 'Senha invalida' });

		case 'user not found':
			return res.status(400).json({ error: 'Esse usuário não existe' });

		case 'confirm password invalid':
			return res.status(400).json({ error: 'Confirmação de senha invalida' });

		default:
			console.log(err);
			return res.status(500).json({ error: 'Internal Server Error' });
	}
}