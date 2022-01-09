import { Schema, model, connection } from 'mongoose';

type CommentType = {
	postId: string,
	commentedByUsers: object[]
};

const schema = new Schema<CommentType>({
	postId: { type: String, required: true },
	commentedByUsers: { type: [Object], required: true }
});

const modelName = 'Comment';

export default (connection && connection.models[modelName]) ?
connection.models[modelName]
:
model<CommentType>(modelName, schema)
;