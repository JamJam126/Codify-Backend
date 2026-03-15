import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class S3Service {
  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
  });

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const key = `${folder}/${uuidv4()}-${file.originalname}`

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3.send(command);

    return key;
  }

  async getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn });
    return url;
  }
}