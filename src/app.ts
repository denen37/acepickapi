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
import client from "prom-client";
import responseTime from "response-time";

const app = express();
const server = createServer(app);

// -------------------- PROMETHEUS SETUP --------------------
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metrics
const apiResponseHistogram = new client.Histogram({
    name: "api_response_time_ms",
    help: "API response time in ms",
    labelNames: ["method", "route", "status_code"],
    buckets: [50, 100, 300, 500, 1000, 2000], // ms
});

const dbConnectionsGauge = new client.Gauge({
    name: "mysql_active_connections",
    help: "Number of active MySQL connections",
});

const dbUptimeGauge = new client.Gauge({
    name: "mysql_uptime_seconds",
    help: "MySQL server uptime in seconds",
});

// Register metrics
register.registerMetric(apiResponseHistogram);
register.registerMetric(dbConnectionsGauge);
register.registerMetric(dbUptimeGauge);

// Middleware to track response times
app.use(
    responseTime((req: Request, res: Response, time: any) => {
        apiResponseHistogram
            .labels(req.method, req.route?.path || req.url, res.statusCode.toString())
            .observe(time);
    })
);

app.get("/metrics", async (req: Request, res: Response) => {
    try {
        // Update DB connection metric
        const [rows]: any = await db.query("SHOW STATUS LIKE 'Threads_connected'");
        if (rows && rows.length > 0) {
            dbConnectionsGauge.set(parseInt(rows[0].Value, 10));
        }
        const [rows2]: any = await db.query("SHOW GLOBAL STATUS LIKE 'Uptime'");
        const uptime = parseInt(rows2[0].Value, 10) || 0;
        dbUptimeGauge.set(uptime);

        res.set("Content-Type", register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        console.error("Error gathering metrics:", err);
        res.status(500).send("Error gathering metrics");
    }
});

app.get("/metrics/json", async (req: Request, res: Response) => {
    try {
        // Update DB connection metric
        const [rows]: any = await db.query("SHOW STATUS LIKE 'Threads_connected'");
        if (rows && rows.length > 0) {
            dbConnectionsGauge.set(parseInt(rows[0].Value, 10));
        }

        res.set("Content-Type", register.contentType);
        res.json(await register.getMetricsAsJSON());
    } catch (err) {
        console.error("Error gathering metrics:", err);
        res.status(500).send("Error gathering metrics");
    }
});

// ----------------------------------------------------------

app.use(express.json());
app.use(cors({ origin: true }));

app.use("/uploads/", express.static(path.join(__dirname, "../public/uploads")));

app.use(logRoutes);

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Hello, world! This API is working!' });
});

app.all('/api/*', isAuthorized);

app.use("/api", index);
app.use("/api/auth/", auth);
app.use("/api/admin/", admin);
app.use("/api/", general);

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
