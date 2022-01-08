import { Schema, model, connection } from 'mongoose';

type LikeType = {
	postId: string,
	likedByUsers: string[],
};

const schema = new Schema<LikeType>({
	postId: { type: String, required: true },
	likedByUsers: { type: [String], required: true }
});

const modelName: string = 'Like';

export default (connection && connection.models[modelName]) ?
connection.models[modelName]
:
model<LikeType>(modelName, schema)
;