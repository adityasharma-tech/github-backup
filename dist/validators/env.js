"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = __importDefault(require("zod"));
const envSchema = zod_1.default.object({
    PORT: zod_1.default.number().default(5473),
    GITHUB_CLIENT_ID: zod_1.default.string(),
    GITHUB_CLIENT_SECRET: zod_1.default.string(),
    GITHUB_REDIRECT_URL: zod_1.default.url()
});
const env = envSchema.parse(envSchema);
exports.env = env;
//# sourceMappingURL=env.js.map