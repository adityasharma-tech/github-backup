import { backupGithubRepos } from "../controllers/app.controller";
import { Router } from "express";

const router = Router()

router.route('/backup-all-repo').get(backupGithubRepos)

export default router;