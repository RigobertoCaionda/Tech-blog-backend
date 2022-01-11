import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult, matchedData } from 'express-validator';
import User from '../models/User';

class AuthController {// Para criar uma classe em js
	async signup(req: Request, res: Response) {// Forma de criar as propriedades da classe
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.json({ error: errors.mapped() });
			return;
		}

		const { name, email, gender, password, confirmPassword } = matchedData(req);

		if (password != confirmPassword) throw Error('confirm password invalid');

		const existUser = await User.findOne({ email });

		if (existUser) throw Error('email already in use');

		const hash = await bcrypt.hash(password, 10);

		const user = new User({
			name,
			email,
			gender,
			password: hash
		});

		const savedUser = await user.save();

		const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET as string, {
			expiresIn: '30m'
		});// Depois que ele salva o cadastro, cria um token para ele

		return res.status(200).json({ token });
	}

	async signin(req: Request, res: Response) {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.json({ error: errors.mapped() });
			return;
		}

		const { email, password } = matchedData(req);
		const user = await User.findOne({ email });

		if (!user) throw Error('invalid login');

		const passwordIsValid = await bcrypt.compare(password, user.password);

		if (!passwordIsValid) throw Error('invalid login');

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
			expiresIn: '30m'
		});
		
		return res.status(200).json({ token });
	}
}

export default new AuthController();// Exportando a instancia dessa classe, como no java new AuthController()