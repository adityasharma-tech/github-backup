import { ApiResponse } from "../lib/api-response";
import { asyncHandler } from "../lib/async-handler";
import { exec } from "child_process"
import axios, { AxiosHeaders } from "axios";

const backupGithubRepos = asyncHandler(async (req, res, next) => {
  const access_token = req.cookies.access_token;

  console.log(access_token)

  const headers = new AxiosHeaders();
  headers.set("Authorization", "Bearer " + access_token);
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  headers.set("Accept", "application/vnd.github+json");
  const request = await axios.request({
    headers,
    url: "https://api.github.com/user",
  });

  console.log(request.data);
  
  const respositoryListReq = await axios.request({
    headers,
    url: request.data.repos_url,
    params: {
        per_page: 100,
        page: 1,
        type: "private"
    }
  })

  for (const repo of respositoryListReq.data){
    exec(`git clone https://${repo.owner.login}:${access_token}@github.com/${repo.full_name}`, (error, stdout)=>{
        console.log(error, stdout)
    })
  }

  return res.status(200).json(new ApiResponse(200, null));
});

export { backupGithubRepos };
