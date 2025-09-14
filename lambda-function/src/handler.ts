import fs from "fs";
import { Octokit } from "octokit";
import { SQSEvent } from "aws-lambda";
import { exec, spawn } from "child_process";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

export const gitBackup = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const { access_token } = JSON.parse(record.body) as {
      access_token: string;
    };

    if (!access_token) throw new Error("Failed to get access token");

    const octokit = new Octokit({
      auth: access_token,
    });

    const userRequest = await octokit.request("GET /user", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const username = userRequest.data.login;
    const respositoryListReq = await octokit.request("GET /user/repos", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const allPromises: Promise<void>[] = [];

    for (const repo of respositoryListReq.data) {
      allPromises.push(
        new Promise<void>((resolve) => {
          exec(
            `git clone https://${repo.owner.login}:${access_token}@github.com/${repo.full_name} ./repositories/${username}/${repo.name}`,
            (error) => {
              console.log(`./repositories/${username}/${repo.name}`);
              if (error) console.error(`Error occured`);
              resolve();
            }
          );
        })
      );
    }

    await Promise.all(allPromises);

    await new Promise<void>((resolve, reject) => {
      const zip = spawn(
        "zip",
        ["-r", `./archives/${username}.zip`, `./repositories/${username}/`],
        {
          stdio: "ignore",
        }
      );
      zip.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`zip process exited with code ${code}`));
        } else {
          resolve();
        }
      });
    });

    while (true) {
      if (fs.existsSync(`./archives/${username}.zip`)) break;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }


    const s3 = new S3Client({
        region: "ap-south-1"
    })

    const bucketName = "github-backup-lkjklasdlfkjasdf"
    const objectKey = `uploads/${access_token}.zip`

    const filepath = `./archives/${username}.zip`

    const fileBody = fs.createReadStream(filepath);

    await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: fileBody
    }))
  }

  return {
    status: "success"
  }
};