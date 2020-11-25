import AWS, { CodeBuild } from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import {config} from 'dotenv';

config();

const folderToUpload = "uploaded_from_computer/";
const spaceEndpoint = process.env.DO_SPACE_ENDPOINT || "";
const accessKeyId = process.env.DO_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.DO_SECRET_ACCESS_KEY || "";
const bucket = "anakonta-skydra";

// Configure client for use with Spaces
const spacesEndpoint = new AWS.Endpoint(spaceEndpoint);
export const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId,
    secretAccessKey
});


export const upload = multer({
  storage: multerS3({
    s3,
    bucket,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req: Express.Request, file: Express.Multer.File, cb:(error: any, metadata?: any) => void) => {
      cb(null, {
        fieldName: file.fieldname,
      })
    },
    key: (req: Express.Request, file: Express.Multer.File, cb: (error: any, key?: string | undefined) => void) => {
      cb(null, folderToUpload + file.originalname);
    }
  })
}).single("upload")