import { Schema, model, connection } from "mongoose";

type PostType = {
  status: boolean;
  title: string;
  dateCreated: Date;
  desc: string;
  subject: string[];
  text: string[];
  views: number;
  likes: number;
  userId: string;
};

const schema = new Schema<PostType>({
  status: { type: Boolean, required: true },
  title: { type: String, required: true },
  dateCreated: Date,
  desc: { type: String, required: true },
  subject: { type: [String], required: true },
  text: { type: [String], required: true },
  views: { type: Number, required: true },
  likes: { type: Number, required: true },
  userId: String
});

const modelName: string = "Post";

export default connection && connection.models[modelName]
  ? connection.models[modelName]
  : model<PostType>(modelName, schema);
