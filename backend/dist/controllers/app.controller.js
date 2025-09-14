"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = exports.backupGithubRepos = void 0;
const async_handler_1 = require("../lib/async-handler");
const octokit_1 = require("octokit");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const backupGithubRepos = (0, async_handler_1.asyncHandler)(async (req, res, next) => {
    const access_token = req.cookies.access_token;
    console.log(access_token);
    const octokit = new octokit_1.Octokit({
        auth: access_token,
    });
    const userRequest = await octokit.request("GET /user", {
        headers: {
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });
    console.log(userRequest.data);
    const username = userRequest.data.login;
    const respositoryListReq = await octokit.request("GET /user/repos", {
        headers: {
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });
    const allPromises = [];
    for (const repo of respositoryListReq.data) {
        allPromises.push(new Promise((resolve) => {
            (0, child_process_1.exec)(`git clone https://${repo.owner.login}:${access_token}@github.com/${repo.full_name} ./repositories/${username}/${repo.name}`, (error) => {
                console.log(`./repositories/${username}/${repo.name}`);
                if (error)
                    console.error(`Error occured`);
                resolve();
            });
        }));
    }
    await Promise.all(allPromises);
    await new Promise((resolve, reject) => {
        const zip = (0, child_process_1.spawn)("zip", ["-r", `./archives/${username}.zip`, `./repositories/${username}/`], {
            stdio: "ignore",
        });
        zip.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`zip process exited with code ${code}`));
            }
            else {
                resolve();
            }
        });
    });
    while (true) {
        if (fs_1.default.existsSync(`./archives/${username}.zip`))
            break;
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return res.download(`./archives/${username}.zip`, `${username}.zip`, (err) => {
        if (err) {
            console.error("Download error:", err);
        }
    });
});
exports.backupGithubRepos = backupGithubRepos;
const test = (0, async_handler_1.asyncHandler)((req, res) => {
    return res.download('./archives/adityasharma-tech.zip');
});
exports.test = test;
//# sourceMappingURL=app.controller.js.map