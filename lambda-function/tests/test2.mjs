import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.ACCESS_TOKEN,
});

const req1 = await octokit.request("GET /user/emails", {
  headers: {
    "X-GitHub-Api-Version": "2022-11-28",
  },
});

async function getRepositoryList(page = 1) {
  return (
    await octokit.request("GET /user/repos", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
      type: "all",
      per_page: 100,
      page
    })
  ).data;
}

let currentPage = 1;

const repositories = [];

while(true){
    const repoList = await getRepositoryList(currentPage);
    const nextRepoList = await getRepositoryList(currentPage+1);
    currentPage++;
    if(nextRepoList.length <= 0) break;
    else repositories.push(...nextRepoList);
    repositories.push(...repoList);
}

console.log(repositories.length)
