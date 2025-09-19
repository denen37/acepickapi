"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { createServer } = require('http');
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./config/db"));
const configSetup_1 = __importDefault(require("./config/configSetup"));
const cors_1 = __importDefault(require("cors"));
const logRoutes_1 = require("./middlewares/logRoutes");
const authorize_1 = require("./middlewares/authorize");
const index_1 = __importDefault(require("./routes/index"));
const auth_1 = __importDefault(require("./routes/auth"));
const general_1 = __importDefault(require("./routes/general"));
const admin_1 = __importDefault(require("./routes/admin"));
require("reflect-metadata");
const chat_1 = require("./chat");
const jobHook_1 = require("./hooks/jobHook");
const prom_client_1 = __importDefault(require("prom-client"));
const response_time_1 = __importDefault(require("response-time"));
const app = (0, express_1.default)();
const server = createServer(app);
// -------------------- PROMETHEUS SETUP --------------------
const register = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register });
// Custom metrics
const apiResponseHistogram = new prom_client_1.default.Histogram({
    name: "api_response_time_ms",
    help: "API response time in ms",
    labelNames: ["method", "route", "status_code"],
    buckets: [50, 100, 300, 500, 1000, 2000], // ms
});
const dbConnectionsGauge = new prom_client_1.default.Gauge({
    name: "mysql_active_connections",
    help: "Number of active MySQL connections",
});
const dbUptimeGauge = new prom_client_1.default.Gauge({
    name: "mysql_uptime_seconds",
    help: "MySQL server uptime in seconds",
});
// Register metrics
register.registerMetric(apiResponseHistogram);
register.registerMetric(dbConnectionsGauge);
register.registerMetric(dbUptimeGauge);
// Middleware to track response times
app.use((0, response_time_1.default)((req, res, time) => {
    var _a;
    apiResponseHistogram
        .labels(req.method, ((_a = req.route) === null || _a === void 0 ? void 0 : _a.path) || req.url, res.statusCode.toString())
        .observe(time);
}));
app.get("/metrics", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Update DB connection metric
        const [rows] = yield db_1.default.query("SHOW STATUS LIKE 'Threads_connected'");
        if (rows && rows.length > 0) {
            dbConnectionsGauge.set(parseInt(rows[0].Value, 10));
        }
        const [rows2] = yield db_1.default.query("SHOW GLOBAL STATUS LIKE 'Uptime'");
        const uptime = parseInt(rows2[0].Value, 10) || 0;
        dbUptimeGauge.set(uptime);
        res.set("Content-Type", register.contentType);
        res.end(yield register.metrics());
    }
    catch (err) {
        console.error("Error gathering metrics:", err);
        res.status(500).send("Error gathering metrics");
    }
}));
app.get("/metrics/json", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Update DB connection metric
        const [rows] = yield db_1.default.query("SHOW STATUS LIKE 'Threads_connected'");
        if (rows && rows.length > 0) {
            dbConnectionsGauge.set(parseInt(rows[0].Value, 10));
        }
        res.set("Content-Type", register.contentType);
        res.json(yield register.getMetricsAsJSON());
    }
    catch (err) {
        console.error("Error gathering metrics:", err);
        res.status(500).send("Error gathering metrics");
    }
}));
// ----------------------------------------------------------
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: true }));
app.use("/uploads/", express_1.default.static(path_1.default.join(__dirname, "../public/uploads")));
app.use(logRoutes_1.logRoutes);
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello, world! This API is working!' });
});
app.all('/api/*', authorize_1.isAuthorized);
app.use("/api", index_1.default);
app.use("/api/auth/", auth_1.default);
app.use("/api/admin/", admin_1.default);
app.use("/api/", general_1.default);
(0, chat_1.initSocket)(server);
db_1.default.sync().then(() => {
    (0, jobHook_1.registerJobHook)();
    server.listen(configSetup_1.default.PORT || 5000, configSetup_1.default.DEV_HOST || '0.0.0.0', () => console.log(`Server is running on http://${configSetup_1.default.DEV_HOST}:${configSetup_1.default.PORT}`));
}).catch(err => console.error('Error connecting to the database', err));
exports.default = app;
