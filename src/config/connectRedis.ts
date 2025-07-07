import dotenv from 'dotenv';
import { Redis } from 'ioredis';

dotenv.config();

export let redis: Redis;

export const connectRedis = async () => {
    try {
        redis = new Redis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD,
        });

        redis.on('connect', () => {
            console.log('Redis connected');
        });

        redis.on('error', (err) => {
            console.error('Redis connection error:', err);
        });

        // Optional: ping check
        const pong = await redis.ping();
        if (pong === 'PONG') {
            console.log('Redis is alive');
        }
    } catch (error) {
        console.error('Redis connection failed:', error);
    }
};
