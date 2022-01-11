import { ErrorRequestHandler } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';// Para lidar com erros do jsonwebtoken

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {//Funcao que vai lidar com os erros
	if (err instanceof JsonWebTokenError) {
		return res.status(400).json({ data: { error: 'this token is not valid' } });
	}

	switch(err.message) {//Cada case e um tipo de erro diferente que precisaremos lidar com
		case 'token is necessary':
			return res.status(401).json({ data: { error: 'token é necessário' } });

		case 'without id':
			return res.status(401).json({ data: { error: 'Id é necessário' } });

		case 'id invalid':
			return res.status(401).json({ data: { error: 'Esse id é inválido' } });

		case 'post not found':
			return res.status(401).json({ data: { error: 'Esse post não existe' } });

		case 'data invalid':
			return res.status(401).json({ data: { error: 'Requisição inválida' } });

		case 'email already in use':
			return res.status(400).json({ data: { error: 'Email já existe' } });

		case 'invalid login':
			return res.status(400).json({ data: { error: 'Email e/ou senha errados' } });

		case 'user not found':
			return res.status(400).json({ data: { error: 'Esse usuário não existe' } });

		case 'confirm password invalid':
			return res.status(400).json({ data: { error: 'Confirmação de senha inválida' } });

		case 'already liked':
			return res.status(400).json({ data: { status: 'você já curtiu esse comentário' } });

		case 'unexpected process':
			return res.status(500).json({ data: { error: 'Algo deu errado' } });

		default:
			console.log(err);
			return res.status(500).json({ data: { error: 'Internal Server Error' } });
	}
}