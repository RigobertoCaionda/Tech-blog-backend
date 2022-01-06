import { Schema, model, connection } from 'mongoose';

type UserType = {
	name: string,
	email: string,
	gender: string,
	password: string,
	confirmPassword: string,
	token: string
};

const schema = new Schema<UserType>({
	name: { type: String, required: true },
	email: { type: String, required: true },
	gender: { type: String, required: true },
	password: { type: String, required: true },
	confirmPassword: { type: String, required: true },
	token: String
});

const modelName: string = 'User';

export default (connection && connection.models[modelName]) ? 
	connection.models[modelName] 
	: 
	model<UserType>(modelName, schema)
	;