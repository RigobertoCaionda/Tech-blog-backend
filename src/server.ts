import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import "express-async-errors"; //Para trabalhar com erros. Obs: Deve ficar antes das rotas

import { resolve } from "path";
import fileupload from "express-fileupload";

import apiRoutes from "./routes/api";
import { mongoConnect } from "./database/mongo";
import { errorHandler } from "./errors"; //Funcao que lida com os erros

dotenv.config();
mongoConnect(); //Verifica se estamos devidamente conectados ao mongo

const server = express();

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(fileupload()); //Para poder receber arquivos, e um middleware
server.use("/file", express.static(resolve(__dirname, "../public/media")));
server.use("/", apiRoutes);
server.use(errorHandler);

server.use((req, res) => {
  res.status(404).json({ data: { error: "Endpoint não encontrado" } });
});

server.listen(process.env.PORT ?? 3333); // ?? em js pega o valor da esquerda, caso nao exista pega o da direita
