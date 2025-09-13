"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGithubCallback = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../validators/env");
const api_error_1 = require("../lib/api-error");
const async_handler_1 = require("../lib/async-handler");
const handleGithubCallback = (0, async_handler_1.asyncHandler)(async (req, res) => {
    let githubCode = req.query.code;
    if (!githubCode)
        throw new api_error_1.ApiError(400, "Failed to authenticate through github");
    githubCode = githubCode.toString();
    const searchParams = new URLSearchParams();
    searchParams.append("client_id", env_1.env.GITHUB_CLIENT_ID);
    searchParams.append("client_secret", env_1.env.GITHUB_CLIENT_SECRET);
    searchParams.append("code", githubCode);
    searchParams.append("redirect_uri", env_1.env.GITHUB_REDIRECT_URL);
    let access_token;
    let token_type;
    let scope;
    try {
        const request = await axios_1.default.post(`https://github.com/login/oauth/access_token?${searchParams.toString()}`);
        console.log(request.data); // access_token=gho_oaNTFaBW9XYgchqmX&scope=repo&token_type=bearer
        if (!request.data.access_token)
            throw new api_error_1.ApiError(400, "Failed to get verification code");
        access_token = request.data.access_token;
        token_type = request.data.token_type;
        scope = request.data.scope;
    }
    catch (error) {
        throw new api_error_1.ApiError(400, "some error occured");
    }
    return res.redirect(`https://git-backup.adityasharma.tech?access_token=${access_token}&token_type=${token_type}&scope=${scope}`);
});
exports.handleGithubCallback = handleGithubCallback;
//# sourceMappingURL=callback.controller.js.map