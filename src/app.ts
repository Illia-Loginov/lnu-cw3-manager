import express from 'express';
import http from 'http';
import { chatRoutes, healthcheck } from './routes';
import { errorHandler } from './middlewares';
import { serverConfig } from './config';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(
  cors({
    origin: serverConfig.frontendUrl
  })
);

app.get('/', healthcheck);
app.use('/chats', chatRoutes);
app.use(errorHandler);

export { app, server };
