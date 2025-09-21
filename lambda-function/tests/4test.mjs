import {config}from "dotenv"
import { PassThrough } from "stream"
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import archiver from "archiver";
import { fromEnv } from "@aws-sdk/credential-provider-env"

config({
    path: "../git-backup/.env"
})

const s3 = new S3Client({
  region: "ap-south-1",
  credentials: fromEnv()
});

const bucketName = "github-backup-lkjklasdlfkjasdf";
const objectKey = `uploads/testing-${Math.random().toString()}.zip`;

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

archive.directory(`./node_modules`, false);

archive.finalize();

await upload.done();
