import http from 'http';
import express from "express";
import "express-async-errors";
import cors from "cors";
import jwt from "jsonwebtoken";
import { WebSocketServer, WebSocket } from "ws";
import { AppDataSource } from "./data-source";
import { GameUser } from "./entities/GameUser";
import { JWT_SECRET } from "./config";
import router from "./router/index";
import { responseHandler, errorHandler } from "./middleware/response";
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(responseHandler);
app.use(express.static(path.join(__dirname, "public")));

// 端口监听
const port = process.env.PORT || 7998;

const server = http.createServer(app);
server.on('error', (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
    default:
      throw error;
  }
});
server.on('listening', () => {
  const addr = server.address();
  if (!addr) return;
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
});

const wss = new WebSocketServer({ server });

export interface ClientInfo {
    ws: WebSocket;
    userId: string;
    gameKey: string;
    attributes: any;
}

export const clients: Map<string, ClientInfo> = new Map();

wss.on("connection", (ws, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
        ws.close(1008, "Token Required");
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const userId = decoded.userId;
        const gameKey = decoded.gameKey;
        const clientId = `${userId}_${Math.random().toString(36).substring(7)}`;

        const clientInfo: ClientInfo = {
            ws,
            userId,
            gameKey,
            attributes: {}
        };
        clients.set(clientId, clientInfo);

        // 记录登录并同步属性
        const gameUserRepo = AppDataSource.getMongoRepository(GameUser);
        gameUserRepo.findOneAndUpdate(
            { gameKey, userId },
            { 
                $set: { lastLoginAt: new Date() },
                $setOnInsert: { gameKey, userId, attributes: {} }
            },
            { upsert: true, returnDocument: 'after' }
        ).then(result => {
            if (result && result.value) {
                clientInfo.attributes = result.value.attributes || {};
                ws.send(JSON.stringify({ type: "attributes_sync", attributes: clientInfo.attributes }));
            }
        });

        ws.on("message", async (message) => {
            try {
                const data = JSON.parse(message.toString());
                if (data.type === "set_attributes") {
                    if (JSON.stringify(data.attributes).length > 1024) {
                        return ws.send(JSON.stringify({ error: "Attributes exceed 1KB" }));
                    }
                    clientInfo.attributes = data.attributes;
                    
                    // 持久化属性
                    await gameUserRepo.updateOne(
                        { gameKey, userId },
                        { $set: { attributes: data.attributes } }
                    );

                    ws.send(JSON.stringify({ type: "attributes_updated", attributes: clientInfo.attributes }));
                } else if (data.type === "get_devices") {
                    const otherDevices = Array.from(clients.entries())
                        .filter(([id, info]) => info.userId === userId && id !== clientId)
                        .map(([id, info]) => ({
                            clientId: id,
                            gameKey: info.gameKey,
                            attributes: info.attributes
                        }));
                    ws.send(JSON.stringify({ type: "devices_info", devices: otherDevices }));
                }
            } catch (e) {
                console.error("WS Message Error:", e);
            }
        });

        ws.on("close", () => {
            clients.delete(clientId);
        });

    } catch (err) {
        ws.close(1008, "Invalid Token");
    }
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        
        // 挂载主路由
        app.use("/api", router);

        // 错误处理中间件
        app.use(errorHandler);

        // 启动服务器
        server.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    })
    .catch((error) => console.log(error));
