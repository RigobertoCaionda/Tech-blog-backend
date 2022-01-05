import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { resolve } from 'path';
import apiRoutes from './routes/api';

dotenv.config();

const server = express();

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use('/file', express.static(resolve(__dirname, '../public/media')));
server.use('/', apiRoutes);

server.listen(process.env.PORT, () => {
	console.log(`Rodando no endereço ${process.env.BASE}`);
});

//Ver o endpoint nao encontrado e ver o server e instalar coisas