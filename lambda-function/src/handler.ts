import { PassThrough } from "stream"
import { Octokit } from "octokit";
import { SQSEvent } from "aws-lambda";
import { exec, execSync } from "child_process";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import archiver from "archiver";

async function runWithConcurrency<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  concurrency: number
) {
  const results: Promise<void>[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = items[index++];
      await fn(current);
    }
  }

  for (let i = 0; i < concurrency; i++) {
    results.push(worker());
  }

  await Promise.all(results);
}

export const gitBackup = async (event: SQSEvent) => {
  for (const record of event.Records) {
    console.log(record.body);
    const { access_token } = JSON.parse(record.body) as {
      access_token: {
        name: "access_token";
        value: `gho_${string}`;
      };
    };

    if (!access_token) throw new Error("Failed to get access token");

    const octokit = new Octokit({
      auth: access_token.value,
    });

    const userRequest = await octokit.request("GET /user", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const username = userRequest.data.login;

    try {
      const result = execSync("rm -r /tmp/*");
      console.log(result.toString());
    } catch (error) {
      console.error("deleting file in /tmp/*", error);
    }

    async function getRepositoryList(page = 1) {
      return (
        await octokit.request("GET /user/repos", {
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
          type: "all",
          per_page: 100,
          page,
        })
      ).data;
    }

    let currentPage = 1;

    const repositories = [];

    while (true) {
      const repoList = await getRepositoryList(currentPage);
      const nextRepoList = await getRepositoryList(currentPage + 1);
      currentPage++;
      if (nextRepoList.length <= 0) break;
      else repositories.push(...nextRepoList);
      repositories.push(...repoList);
    }

    console.log("Here are the libraries: ", repositories);

    await new Promise<void>((resolve) => {
      exec(`mkdir /tmp/repositories /tmp/archives`, (error: any) => {
        if (error) console.error(`Error occured`, error);
        resolve();
      });
    });

    await runWithConcurrency(
      repositories,
      async (repo) => {
        await new Promise<void>((resolve) => {
          exec(
            `git clone --depth 1 https://${repo.owner.login}:${access_token.value}@github.com/${repo.full_name} /tmp/repositories/${username}/${repo.name}`,
            { timeout: 200_000 },
            (error: any) => {
              console.log(`/tmp/repositories/${username}/${repo.name}`);
              if (error) console.error(`Error occured`, error);
              resolve();
            }
          );
        });
      },
      10
    );

    const s3 = new S3Client({
      region: "ap-south-1",
    });

    const bucketName = "github-backup-lkjklasdlfkjasdf";
    const objectKey = `uploads/${access_token.value}.zip`;

    const archive = archiver("zip", { zlib: { level: 9 } });
    const pass = new PassThrough();

    archive.pipe(pass);

    const upload = new Upload({
      client: s3,
      params: {
        Key: objectKey,
        Bucket: bucketName,
        Body: pass,
      },
    });

    archive.on("error", (err) => {
      console.error(err);
    });

    archive.directory(`/tmp/repositories/${username}/`, false);

    archive.finalize();

    await upload.done();

    console.log(`Uploaded archive: s3://${bucketName}/${objectKey}`);
  }

  return {
    status: "success",
  };
};
