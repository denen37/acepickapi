import express, { Request, Response } from 'express';
const { createServer } = require('http');
import * as dotenv from 'dotenv';
import path from "path";
import db from './config/db';
import config from './config/configSetup';
import cors from 'cors';
import { logRoutes } from './middlewares/logRoutes';
import { isAuthorized } from './middlewares/authorize';
import index from './routes/index';
import auth from './routes/auth';
import profiles from './routes/profiles';
import general from './routes/general';
import "reflect-metadata";
import initSocket from './chat';
import chatSocket from './chat';

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(cors({ origin: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.use(logRoutes);

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Hello, world! This is the user service' });
});


app.all('*', isAuthorized);
app.use("/api", index);
app.use("/api/auth/", auth);
app.use('/api/', general);

// consumeJobEvents();
chatSocket(server);


db.sync().then(() => {
    server.listen(
        config.PORT || 5000,
        config.HOST || '0.0.0.0',
        () => console.log(`Server is running on http://${config.HOST}:${config.PORT}`));
})
    .catch(err => console.error('Error connecting to the database', err));


export default app;
