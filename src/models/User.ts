import { Schema, model, connection } from 'mongoose';

type UserType = {
	status: boolean,
	name: string,
	email: string,
	gender: string,
	password: string,
	image: string
};

const schema = new Schema<UserType>({
	status: { type: Boolean, required: true },
	name: { type: String, required: true },
	email: { type: String, required: true },
	gender: { type: String, required: true },
	password: { type: String, required: true },
	image: String
});

const modelName: string = 'User';

export default (connection && connection.models[modelName]) ? 
	connection.models[modelName] 
	: 
	model<UserType>(modelName, schema)
	;