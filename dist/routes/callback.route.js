"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const callback_controller_1 = require("../controllers/callback.controller");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.route("/github").get(callback_controller_1.handleGithubCallback);
exports.default = router;
//# sourceMappingURL=callback.route.js.map