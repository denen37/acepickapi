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
import general from './routes/general';
import admin from './routes/admin'
import "reflect-metadata";
import { initSocket } from './chat';
import { registerJobHook } from './hooks/jobHook';

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(cors({ origin: true }));

// ✅ Serve static files BEFORE auth check
app.use("/uploads/", express.static(path.join(__dirname, "../public/uploads")));

app.use(logRoutes);

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Hello, world! This API is working!' });
});

// ✅ Protect only API routes, not static/public
app.all('/api/*', isAuthorized);

app.use("/api", index);
app.use("/api/auth/", auth);
app.use("/api/admin/", admin);
app.use("/api/", general);

// consumeJobEvents();
initSocket(server);

db.sync().then(() => {
    registerJobHook();
    server.listen(
        config.PORT || 5000,
        config.DEV_HOST || '0.0.0.0',
        () => console.log(`Server is running on http://${config.DEV_HOST}:${config.PORT}`)
    );
}).catch(err => console.error('Error connecting to the database', err));

export default app;