import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { resolve } from 'path';
import {mongoConnect} from './database/mongo';
import apiRoutes from './routes/api';

dotenv.config();

mongoConnect();//Verificando se esta ou nao conectado ao db, nova forma

const server = express();

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use('/file', express.static(resolve(__dirname, '../public/media')));
server.use('/', apiRoutes);

server.use((req: Request, res: Response) => {
	res.status(404);
	res.json({ data: { error: 'Endpoint não encontrado!' } });
});

server.listen(process.env.PORT, () => {
	console.log(`Rodando no endereço ${process.env.BASE}`);
});

//Ver o endpoint nao encontrado e ver o server e instalar coisas