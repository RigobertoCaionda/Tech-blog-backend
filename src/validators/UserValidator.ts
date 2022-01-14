import { checkSchema } from 'express-validator';

export default {
	editProfile: checkSchema({
		name: {
			optional: true,
			trim: true,
			isLength: {
				options: { min: 2 }
			},
			errorMessage: 'Nome precisa ter pelo menos 2 caracteres!'
		},
		email: {
			optional: true,
			isEmail: true,
			normalizeEmail: true,
			errorMessage: 'Email inválido!'
		},
		gender: {
			optional: true,
			notEmpty: true,
			errorMessage: 'Género não preenchido!'
		},
		password: {
			optional: true,
			isLength: {
				options: { min: 8 }
			},
			errorMessage: 'Senha precisa ter 8 caracteres no minimo'
		},
		confirmPassword: {
			optional: true,
			isLength: {
				options: { min: 8 }
			},
			errorMessage: 'Confirmar senha precisa ter 8 caracteres no minimo'
		},
		knownPassWord: {
			optional: true
		}
	})
}