import Redis from "ioredis";
import config from "./configSetup"

const redis = new Redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASSWORD,
    retryStrategy(times) {
        console.log(`🔁 Reconnecting to Redis... attempt #${times}`);
        return Math.min(times * 1000, 5000); // Retry up to every 5s
    },
});

redis.on("connect", () => console.log("✅ Connected to Redis"));
redis.on("ready", () => console.log("🚀 Redis is ready to use"));
redis.on("error", (err) => console.error("❌ Redis error:", err.message));
redis.on("end", () => console.warn("⚠️ Redis connection closed"));

export default redis;
