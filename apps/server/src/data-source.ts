import "reflect-metadata";
import { DataSource } from "typeorm";
import { Game } from "./entities/Game";
import { User } from "./entities/User";
import { Archive } from "./entities/Archive";
import { Config } from "./entities/Config";
import { GameUser } from "./entities/GameUser";
import { MONGO_URL } from "./config";

export const AppDataSource = new DataSource({
    type: "mongodb",
    url: MONGO_URL,
    synchronize: true,
    logging: false,
    entities: [Game, User, Archive, Config, GameUser],
    migrations: [],
    subscribers: [],
});
