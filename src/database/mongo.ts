import { connect } from 'mongoose';

export const mongoConnect = async () => {
	try {
		console.log("Conectando ao MongoDB...");
		await connect(process.env.DATABASE as string);
		console.log("Mongo conectado!");
	} catch(error) {
		console.log("Erro de conexao Mongo:", error);
	}
}