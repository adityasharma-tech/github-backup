import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";
import { fromEnv } from "@aws-sdk/credential-providers"
import { SendMessageCommand, SQSClient,  } from "@aws-sdk/client-sqs";

// export async function GET(req: NextRequest) {
//   const access_token = req.cookies.get('access_token');

//   console.log(access_token);

//   const octokit = new Octokit({
//     auth: access_token,
//   });

  const userRequest = await octokit.request("GET /user", {
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

//   console.log(userRequest.data);

//   const username = userRequest.data.login;

//   const respositoryListReq = await octokit.request("GET /user/repos", {
//     headers: {
//       "X-GitHub-Api-Version": "2022-11-28",
//     },
//   });

//   const allPromises: Promise<void>[] = [];

//   for (const repo of respositoryListReq.data) {
//     allPromises.push(
//       new Promise<void>((resolve) => {
//         exec(
//           `git clone https://${repo.owner.login}:${access_token}@github.com/${repo.full_name} ./repositories/${username}/${repo.name}`,
//           (error) => {
//             console.log(`./repositories/${username}/${repo.name}`);
//             if (error) console.error(`Error occured`);
//             resolve();
//           }
//         );
//       })
//     );
//   }

//   await Promise.all(allPromises);

//   await new Promise<void>((resolve, reject) => {
//     const zip = spawn(
//       "zip",
//       ["-r", `./archives/${username}.zip`, `./repositories/${username}/`],
//       {
//         stdio: "ignore",
//       }
//     );
//     zip.on("close", (code) => {
//       if (code !== 0) {
//         reject(new Error(`zip process exited with code ${code}`));
//       } else {
//         resolve();
//       }
//     });
//   });

//   while (true) {
//     if (fs.existsSync(`./archives/${username}.zip`)) break;
//     await new Promise((resolve) => setTimeout(resolve, 500));
//   }

//   return res.download(
//     `./archives/${username}.zip`,
//     `${username}.zip`,
//     (err) => {
//       if (err) {
//         console.error("Download error:", err);
//       }
//     }
//   );
// }

const REGION = "ap-south-1"
const QUEUE_URL = "https://sqs.ap-south-1.amazonaws.com/818682288285/GitBackup"

export async function POST(req: NextRequest) {
    const access_token = req.cookies.get('access_token');

    if(!access_token) return NextResponse.json({ message: "Unauthorized" }, { status: 400 });

    const sqs = new SQSClient({
        region: REGION,
        credentials: fromEnv()
    })

    await sqs.send(new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify({
            access_token
        })
    }))

    return NextResponse.json({ message: "added to queue" });
}