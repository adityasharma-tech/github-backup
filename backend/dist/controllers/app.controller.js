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
exports.backupGithubRepos = void 0;
const api_response_1 = require("../lib/api-response");
const async_handler_1 = require("../lib/async-handler");
const child_process_1 = require("child_process");
const axios_1 = __importStar(require("axios"));
const backupGithubRepos = (0, async_handler_1.asyncHandler)(async (req, res, next) => {
    const access_token = req.cookies.access_token;
    console.log(access_token);
    const headers = new axios_1.AxiosHeaders();
    headers.set("Authorization", "Bearer " + access_token);
    headers.set("X-GitHub-Api-Version", "2022-11-28");
    headers.set("Accept", "application/vnd.github+json");
    const request = await axios_1.default.request({
        headers,
        url: "https://api.github.com/user",
    });
    console.log(request.data);
    const respositoryListReq = await axios_1.default.request({
        headers,
        url: request.data.repos_url,
        params: {
            per_page: 100,
            page: 1,
            type: "private"
        }
    });
    for (const repo of respositoryListReq.data) {
        (0, child_process_1.exec)(`git clone https://${repo.owner.login}:${access_token}@github.com/${repo.full_name} ./repositories/${repo.full_name}`, (error, stdout) => {
            console.log(error, stdout);
        });
    }
    return res.status(200).json(new api_response_1.ApiResponse(200, null));
});
exports.backupGithubRepos = backupGithubRepos;
//# sourceMappingURL=app.controller.js.map