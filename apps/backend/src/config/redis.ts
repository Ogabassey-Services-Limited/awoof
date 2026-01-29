/**
 * Redis Configuration
 * 
 * Redis connection setup using ioredis
 * Follows Dependency Inversion Principle - uses interface for cache
 */

import Redis from 'ioredis';
import { config } from './env.js';

/**
 * Redis client instance
 * Singleton pattern ensures single connection
 */
class RedisClient {
    private client: Redis | null = null;
    private static instance: RedisClient;

    private constructor() {
        // Private constructor for singleton
    }

    /**
     * Get Redis instance (Singleton)
     */
    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    /**
     * Initialize Redis connection
     */
    public initialize(): Redis {
        if (this.client) {
            return this.client;
        }

        const baseOptions = {
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
            lazyConnect: true,
            ...(config.redis.password && { password: config.redis.password }),
        };

        // Prioritize host/port if host is not 'localhost' (Docker environment)
        // Otherwise use URL if provided
        if (config.redis.host !== 'localhost' && config.redis.host !== '127.0.0.1') {
            // Docker environment - use host/port directly
            this.client = new Redis({
                host: config.redis.host,
                port: config.redis.port,
                ...baseOptions,
            });
        } else if (config.redis.url) {
            // Local development - use URL if provided
            this.client = new Redis(config.redis.url, baseOptions);
        } else {
            // Fallback to host/port
            this.client = new Redis({
                host: config.redis.host,
                port: config.redis.port,
                ...baseOptions,
            });
        }

        // Event handlers
        this.client.on('connect', () => {
            console.log('✅ Redis connected successfully');
        });

        this.client.on('error', (err) => {
            console.error('❌ Redis connection error:', err);
        });

        this.client.on('close', () => {
            console.log('⚠️ Redis connection closed');
        });

        // Connect
        this.client.connect().catch((err) => {
            console.error('❌ Failed to connect to Redis:', err);
            // Don't exit - app can work without Redis (graceful degradation)
        });

        return this.client;
    }

    /**
     * Get Redis client
     */
    public getClient(): Redis {
        if (!this.client) {
            return this.initialize();
        }
        return this.client;
    }

    /**
     * Close Redis connection
     */
    public async close(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.client = null;
            console.log('✅ Redis connection closed');
        }
    }

    /**
     * Check if Redis is connected
     */
    public isConnected(): boolean {
        return this.client?.status === 'ready';
    }
}

export const redis = RedisClient.getInstance();

// Export client for direct access if needed
export const getRedisClient = () => redis.getClient();

