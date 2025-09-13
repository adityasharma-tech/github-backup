import { backupGithubRepos } from "../controllers/app.controller";
import { Router } from "express";

const router = Router()

router.route('/backup-all-repo').post(backupGithubRepos)

export default router;