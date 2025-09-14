"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
(0, dotenv_1.config)({
    debug: true,
    path: "./.env"
});
const app = (0, express_1.default)();
// middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded());
app.use((0, cors_1.default)({
    origin: ['http://localhost:5473', 'http://localhost:5173'],
    methods: ["POST", "GET", "OPTIONS"],
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("combined"));
// router imports
const callback_route_1 = __importDefault(require("./routes/callback.route"));
const app_route_1 = __importDefault(require("./routes/app.route"));
app.use("/api/_callback", callback_route_1.default);
app.use('/api', app_route_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map