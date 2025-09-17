import { config } from "dotenv";
import { ReceiveMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-provider-env";

config({
  path: "../git-backup/.env",
});

const sqs = new SQSClient({
  region: "ap-south-1",
  credentials: fromEnv(),
});

const s3 = new S3Client({
  region: "ap-south-1",
  credentials: fromEnv(),
});

const command = new ListObjectsV2Command({
  Bucket: "github-backup-lkjklasdlfkjasdf",
  Prefix: "uploads/",
  MaxKeys: 100,
});

const result = await s3.send(command);

result.Contents.forEach((obj) => {
  console.log("Key:", obj.Key, " Size:", obj.Size);
});

// const command =
//   new ReceiveMessageCommand({
//     QueueUrl: "https://sqs.ap-south-1.amazonaws.com/818682288285/GitBackup",
//     MaxNumberOfMessages: 10,
//   })

// const response = await sqs.send(command);

// console.log(response.Messages)

// if (response.Messages && response.Messages.length > 0) {
//   console.log("Messages:");
//   response.Messages.forEach((msg, i) => {
//     console.log(`Message ${i + 1}:`, msg.Body);
//   });
// } else {
//   console.log("No messages found in queue.");
// }
