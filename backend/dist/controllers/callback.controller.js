"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGithubCallback = void 0;
const axios_1 = __importStar(require("axios"));
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
        const headers = new axios_1.AxiosHeaders();
        headers.set('Accept', 'application/json');
        const request = await axios_1.default.request({
            url: `https://github.com/login/oauth/access_token?${searchParams.toString()}`,
            headers
        });
        console.log(request.data); // access_token=gho_oaNTFaBW9XYgchqmX&scope=repo&token_type=bearer
        if (!request.data.access_token)
            throw new api_error_1.ApiError(400, "Failed to get verification code");
        access_token = request.data.access_token;
        token_type = request.data.token_type;
        scope = request.data.scope;
    }
    catch (error) {
        console.error(error);
        throw new api_error_1.ApiError(400, "some error occured");
    }
    return res.redirect(`http://localhost:5173?access_token=${access_token}&token_type=${token_type}&scope=${scope}`);
});
exports.handleGithubCallback = handleGithubCallback;
//# sourceMappingURL=callback.controller.js.map