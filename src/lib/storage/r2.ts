import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const bucket = process.env.R2_BUCKET!;
const publicUrl = process.env.R2_PUBLIC_URL!;

export async function uploadAvatar(
  userId: string,
  file: Buffer,
  contentType: string,
  ext: string
): Promise<string> {
  const key = `avatars/${userId}.${ext}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return `${publicUrl}/${key}`;
}

export async function deleteAvatar(userId: string): Promise<void> {
  const extensions = ["jpg", "jpeg", "png", "webp"];

  await Promise.allSettled(
    extensions.map((ext) =>
      r2.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: `avatars/${userId}.${ext}`,
        })
      )
    )
  );
}
