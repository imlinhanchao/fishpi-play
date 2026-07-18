import * as express from 'express';
import { Game } from '../entities/Game';

declare module 'express-serve-static-core' {
    interface Request {
        user: {
            id: string;
            username: string;
            nickname: string;
            avatar: string;
            isAdmin: boolean;
        };
        game: Game;
    }
    interface Response {
        error(message: string, code?: number): this;
    }
}

