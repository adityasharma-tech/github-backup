import { NextRequest, NextResponse } from "next/server";
import { fromEnv } from "@aws-sdk/credential-providers";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { cookies } from "next/headers";

const REGION = "ap-south-1";
const QUEUE_URL = "https://sqs.ap-south-1.amazonaws.com/818682288285/GitBackup";
const BUCKET_NAME = "github-backup-lkjklasdlfkjasdf";

export async function POST(req: NextRequest) {
  const access_token = req.cookies.get("access_token");
  const queued = req.cookies.get("queued")?.value || "false";

  if (!access_token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 400 });

  const s3 = new S3Client({
    region: REGION,
    credentials: fromEnv(),
  });

  let objectExist = false;

  console.log(`uploads/${access_token.value}.zip`);

  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `uploads/${access_token.value}.zip`,
      })
    );
    objectExist = true;
  } catch (error) {
    console.error(error);
  }

  if (objectExist) {
    (await cookies()).delete("queued")
    return NextResponse.json({ status: "ready" });
  };

  if(!objectExist && queued == "true")
    return NextResponse.json({ status: "in-queue" });

  return NextResponse.json({ status: null });
}
