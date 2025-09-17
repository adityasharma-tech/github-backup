import { NextRequest, NextResponse } from "next/server";
import { fromEnv } from "@aws-sdk/credential-providers";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { cookies } from "next/headers";

const REGION = "ap-south-1";
const QUEUE_URL = "https://sqs.ap-south-1.amazonaws.com/818682288285/GitBackup";
const BUCKET_NAME = "github-backup-lkjklasdlfkjasdf";

export async function POST(req: NextRequest) {
  const access_token = req.cookies.get("access_token");

  if (!access_token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 400 });

  const s3 = new S3Client({
    region: REGION,
    credentials: fromEnv(),
  });

  let objectExist = false;

  console.log(`uploads/${access_token.value}.zip`);

  try {
    const result = await s3.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `uploads/${access_token.value}.zip`,
      })
    );
    console.log(result);
    objectExist = true;
  } catch (error) {
    console.error(error);
  }

  if (objectExist) {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `uploads/${access_token.value}.zip`,
      });

      const signedUrl = await getSignedUrl(s3, command, {
        expiresIn: 60 * 60,
      });

      return NextResponse.json({ url: signedUrl });
    } catch (error) {
      console.error(error);
    }
  }

  const sqs = new SQSClient({
    region: REGION,
    credentials: fromEnv(),
  });

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify({
        access_token,
      }),
    })
  );

  (await cookies()).set("queued", "true", {
    maxAge: Date.now() + 1000 * 3600 * 24,
  });

  return NextResponse.json({ message: "added to queue" });
}
