import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { ContentClient, R2Config } from "./client";

export class R2Client implements ContentClient {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(config: R2Config, s3?: S3Client) {
    this.bucket = config.bucket;
    this.s3 =
      s3 ??
      new S3Client({
        region: "auto",
        endpoint:
          config.endpoint ??
          `https://${config.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      });
  }

  async list(prefix: string): Promise<string[]> {
    const result = await this.s3.send(
      new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix })
    );
    return (result.Contents ?? [])
      .map((obj) => obj.Key)
      .filter((k): k is string => typeof k === "string");
  }

  async get(key: string): Promise<string> {
    const result = await this.s3.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key })
    );
    const body = result.Body;
    if (!body || typeof (body as { transformToString?: unknown }).transformToString !== "function") {
      throw new Error(`Unexpected empty body for ${key}`);
    }
    return await (body as { transformToString: () => Promise<string> }).transformToString();
  }

  async put(key: string, body: string): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: "text/markdown; charset=utf-8",
      })
    );
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }
}
