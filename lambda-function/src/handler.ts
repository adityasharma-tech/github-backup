import fs from "fs";
import { Octokit } from "octokit";
import { SQSEvent } from "aws-lambda";
import { exec, spawn } from "child_process";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import archiver from "archiver";

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
    const respositoryListReq = await octokit.request("GET /user/repos", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const allPromises: Promise<void>[] = [];

    await new Promise<void>((resolve) => {
      exec(`mkdir /tmp/repositories /tmp/archives`, (error: any) => {
        if (error) console.error(`Error occured`, error);
        resolve();
      });
    });

    for (const repo of respositoryListReq.data) {
      allPromises.push(
        new Promise<void>((resolve) => {
          exec(
            `git clone https://${repo.owner.login}:${access_token.value}@github.com/${repo.full_name} /tmp/repositories/${username}/${repo.name}`,
            (error: any) => {
              console.log(`/tmp/repositories/${username}/${repo.name}`);
              if (error) console.error(`Error occured`, error);
              resolve();
            }
          );
        })
      );
    }

    await Promise.all(allPromises);

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(`/tmp/archives/${username}.zip`);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => {
        console.log(`Archive created: ${archive.pointer()} total bytes`);
        resolve();
      });
      archive.on("error", (err) => reject(err));

      archive.pipe(output);
      archive.directory(`/tmp/repositories/${username}/`, false);
      archive.finalize();
    });

    while (true) {
      if (fs.existsSync(`/tmp/archives/${username}.zip`)) break;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const s3 = new S3Client({
      region: "ap-south-1",
    });

    const bucketName = "github-backup-lkjklasdlfkjasdf";
    const objectKey = `uploads/${access_token.value}.zip`;

    const filepath = `/tmp/archives/${username}.zip`;

    const fileBody = fs.createReadStream(filepath);

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: fileBody,
      })
    );
  }

  return {
    status: "success",
  };
};
