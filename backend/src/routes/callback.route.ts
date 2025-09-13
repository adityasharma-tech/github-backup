import { handleGithubCallback } from "../controllers/callback.controller";
import { Router } from "express";

const router = Router();

router.route("/github").get(handleGithubCallback)

export default router;
