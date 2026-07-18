import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Archive } from "../entities/Archive";
import { Config } from "../entities/Config";
import { authenticate } from "../middleware/auth";
import { domainCheck } from "../middleware/domainCheck";

const router = Router();

// 应用全局中间件
router.use(authenticate);
router.use(domainCheck);

router.post("/archive", async (req: any, res) => {
    const { content } = req.body;
    if (typeof content !== 'string' || Buffer.byteLength(content) > 2 * 1024 * 1024) {
        return res.status(400).error("Content exceeds 2MB limit" );
    }
    const archiveRepo = AppDataSource.getMongoRepository(Archive);
    await archiveRepo.findOneAndUpdate(
        { gameKey: req.user.gameKey, userId: req.user.userId },
        { $set: { content, updatedAt: new Date() } },
        { upsert: true }
    );
    res.json('OK');
});

router.get("/archive", async (req: any, res) => {
    const archiveRepo = AppDataSource.getMongoRepository(Archive);
    const archive = await archiveRepo.findOneBy({ 
        gameKey: req.user.gameKey, 
        userId: req.user.userId 
    });
    res.json(archive ? { content: archive.content, updatedAt: archive.updatedAt } : null);
});

router.post("/config", async (req: any, res) => {
    const { content } = req.body;
    if (JSON.stringify(content).length > 10 * 1024) {
        return res.status(400).error("Content exceeds 10KB limit" );
    }
    const configRepo = AppDataSource.getMongoRepository(Config);
    await configRepo.findOneAndUpdate(
        { gameKey: req.user.gameKey, userId: req.user.userId },
        { $set: { content, updatedAt: new Date() } },
        { upsert: true }
    );
    res.json('OK');
});

router.get("/config", async (req: any, res) => {
    const configRepo = AppDataSource.getMongoRepository(Config);
    const config = await configRepo.findOneBy({ 
        gameKey: req.user.gameKey, 
        userId: req.user.userId 
    });
    res.json(config ? config.content : null);
});

export default router;
