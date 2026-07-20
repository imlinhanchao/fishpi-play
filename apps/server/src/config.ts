import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'config.json');

export interface AppConfig {
    mongodb: {
        host: string;
        port: number;
        user?: string;
        password?: string;
        database: string;
    };
    jwtSecret: string;
}

let config: AppConfig | null = null;

if (fs.existsSync(configPath)) {
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
        console.error('Failed to parse config.json', e);
    }
}

export const getConfig = () => config;

export const saveConfig = (newConfig: AppConfig) => {
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
};

export const IS_CONFIGURED = !!config;

export const JWT_SECRET = config?.jwtSecret || process.env.JWT_SECRET || "game-platform-secret";

export const MONGO_URL = config ? 
    `mongodb://${config.mongodb.user ? `${config.mongodb.user}:${config.mongodb.password}@` : ''}${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}` : 
    process.env.MONGO_URL || "mongodb://localhost:27017/game-platform";

