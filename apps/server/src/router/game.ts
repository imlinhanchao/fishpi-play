import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Game } from "../entities/Game";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.post("/register", async (req: any, res) => {
    const { name, key, loginCallbackPath, domainWhitelist, description } = req.body;
    const gameRepo = AppDataSource.getMongoRepository(Game);
    
    const existing = await gameRepo.findOneBy({ key });
    if (existing) {
        return res.status(400).error("Game key already exists");
    }

    const game = gameRepo.create({
        name,
        key,
        loginCallbackPath,
        domainWhitelist,
        description,
        status: "pending",
        createBy: req.user.username, // Assuming req.user is populated by the authenticate middleware
        createdAt: new Date(),
        updatedAt: new Date()
    });
    await gameRepo.save(game);
    res.json(game);
});

router.get("/", async (req: any, res) => {
    const { searchValue, status } = req.query;
    const gameRepo = AppDataSource.getMongoRepository(Game);
    
    const query: any = {};
    
    // 权限检查：非管理员只能看自己创建的游戏
    if (!req.user.isAdmin) {
        query.createBy = req.user.username;
    }
    
    if (status) {
        query.status = status;
    }
    
    if (searchValue) {
        const regex = { $regex: searchValue, $options: "i" };
        query.$or = [
            { name: regex },
            { key: regex },
            { description: regex }
        ];
    }

    const games = await gameRepo.find({ where: query });
    res.json(games);
});

export default router;
