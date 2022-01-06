import { checkSchema } from 'express-validator';

export default {
	signup: checkSchema({
		name: {
			trim: true,
			isLength: {
				options: { min: 2 }
			},
			errorMessage: 'Nome precisa ter pelo menos 2 caracteres!'
		},
		email: {
			isEmail: true,
			normalizeEmail: true,
			errorMessage: 'Email inválido!'
		},
		gender: {
			notEmpty: true,
			errorMessage: 'Género não preenchido!'
		},
		password: {
			isLength: {
				options: { min: 8 }
			},
			errorMessage: 'Senha precisa ter 8 caracteres no minimo'
		}
	}),
	signin: checkSchema({
			email: {
				isEmail: true,
				normalizeEmail: true,
				errorMessage: 'Email inválido!'
			},
			password: {
				isLength: {
					options: { min: 8 }
				},
				errorMessage: 'Senha precisa ter 8 caracteres no minimo'
			}		
		})
}