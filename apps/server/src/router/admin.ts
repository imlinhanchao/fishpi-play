import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Game } from "../entities/Game";
import { authenticate } from "../middleware/auth";
import { ObjectId } from "mongodb";

const router = Router();
router.use(authenticate);

// Middleware to check if user is admin
router.use((req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).error("Forbidden: Admin access required");
    }
    next();
});

// Approve a game
router.post("/games/:id/approve", async (req, res) => {
    try {
        const gameRepo = AppDataSource.getMongoRepository(Game);
        const game = await gameRepo.findOneBy({ _id: new ObjectId(req.params.id) } as any);
        
        if (!game) {
            return res.status(404).error("Game not found");
        }

        game.status = "approved";
        game.updatedAt = new Date();
        await gameRepo.save(game);
        
        res.json({ message: "Game approved successfully", game });
    } catch (err) {
        res.status(500).error("Failed to approve game");
    }
});

// Decommission a game
router.post("/games/:id/decommission", async (req, res) => {
    const { reason } = req.body;
    if (!reason) {
        return res.status(400).error("Decommission reason is required");
    }

    try {
        const gameRepo = AppDataSource.getMongoRepository(Game);
        const game = await gameRepo.findOneBy({ _id: new ObjectId(req.params.id) } as any);
        
        if (!game) {
            return res.status(404).error("Game not found");
        }

        game.status = "decommissioned";
        game.decommissionReason = reason;
        game.updatedAt = new Date();
        await gameRepo.save(game);
        
        res.json({ message: "Game decommissioned successfully", game });
    } catch (err) {
        res.status(500).error("Failed to decommission game");
    }
});

export default router;
