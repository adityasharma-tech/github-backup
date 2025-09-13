"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_controller_1 = require("../controllers/app.controller");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.route('/backup-all-repo').post(app_controller_1.backupGithubRepos);
exports.default = router;
//# sourceMappingURL=app.route.js.map