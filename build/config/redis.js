"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default({
    host: "127.0.0.1",
    port: 6379,
    retryStrategy(times) {
        console.log(`🔁 Reconnecting to Redis... attempt #${times}`);
        return Math.min(times * 1000, 5000); // Retry up to every 5s
    },
});
redis.on("connect", () => console.log("✅ Connected to Redis"));
redis.on("ready", () => console.log("🚀 Redis is ready to use"));
redis.on("error", (err) => console.error("❌ Redis error:", err.message));
redis.on("end", () => console.warn("⚠️ Redis connection closed"));
exports.default = redis;
