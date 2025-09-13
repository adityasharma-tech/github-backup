"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./validators/env");
app_1.default.listen(env_1.env.PORT, (error) => {
    if (error)
        console.error(`Failed to start server on port ${env_1.env.PORT}`);
    else
        console.info(`Server started on port http://127.0.0.1:${env_1.env.PORT}`);
});
//# sourceMappingURL=server.js.map