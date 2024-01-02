import fs from 'fs';
import path from 'path';
import http from 'https';
import { inject } from 'tsyringe';
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import {
    PutObjectCommand,
    GetObjectCommand,
    GetObjectCommandOutput,
    S3Client,
    HeadObjectCommand,
    DeleteObjectCommand,
    CopyObjectCommand
} from '@aws-sdk/client-s3';
import * as cfSigner from "@aws-sdk/cloudfront-signer";
import { Readable } from 'stream';
import { Helper } from '../../common/helper';
import { TenantEnvironmentProvider } from '../../auth/tenant.environment/tenant.environment.provider';
import { logger } from '../../logger/logger';
import { TimeUtils } from '../../common/utilities/time.utils';
import { DurationType } from '../../types/miscellaneous/time.types';
import * as s3Signer from '@aws-sdk/s3-request-presigner';

////////////////////////////////////////////////////////////////////////////////

export class AwsManager {

    constructor(
        @inject('TenantName') private _tenantName?: string,
        @inject('TenantEnvironmentProvider') private _tenantEnvProvider?: TenantEnvironmentProvider,
    ) {}

    public getCrossAccountCredentials = async (): Promise<any> => {

        const sts = new STSClient();
        const timestamp = (new Date()).getTime();
        const command = new AssumeRoleCommand({
            // The Amazon Resource Name (ARN) of the role to assume.
            RoleArn         : process.env.ROLE_ARN,
            // An identifier for the assumed role session.
            RoleSessionName : `sts-role-${timestamp}`,
            // The duration, in seconds, of the role session. The value specified
            // can range from 900 seconds (15 minutes) up to the maximum session
            // duration set for the role.
            //DurationSeconds : 900,
        });
        const response = await sts.send(command);
        return {
            accessKeyId     : response.Credentials.AccessKeyId,
            secretAccessKey : response.Credentials.SecretAccessKey,
            sessionToken    : response.Credentials.SessionToken,
        };
    };

    public getS3FileDataAsReadable = async (storageKey: string): Promise<Readable> => {
        const creds = await this.getCrossAccountCredentials();
        var bucket = process.env.BUCKET_NAME;
        const bucket_ = this._tenantEnvProvider.getTenantEnvironmentVariable('S3_BUCKET_NAME');
        if (bucket_) {
            bucket = bucket_;
        }
        const s3 = new S3Client(creds);
        const params = {
            Bucket : bucket,
            Key    : storageKey
        };
        const command = new GetObjectCommand(params);
        const response: GetObjectCommandOutput = await s3.send(command);
        const readable = response.Body as Readable;
        return readable;
    };

    public uploadFileToS3 = async (
        filePath,
        bucket : string = process.env.BUCKET_NAME,
        storagePath : string = null,
        newFilename: string = null) => {
        try {
            logger.info(`uploadFileToS3: ${filePath} ${bucket} ${storagePath} ${newFilename}`);

            const creds: any = await this.getCrossAccountCredentials();
            const fileContent = fs.readFileSync(filePath);
            var fileName = newFilename ?? path.basename(filePath);
            var extension = path.extname(fileName);
            var mimeType = Helper.getMimeType(extension);

            // const cloudFrontPathSplit = cloudFrontPath.split("/");
            // var storageKey = cloudFrontPathSplit[cloudFrontPathSplit.length - 1] + "/" + fileName;

            var storageKey = storagePath + '/' + fileName;

            const s3 = new S3Client(creds);
            const params = {
                Bucket      : bucket,
                Key         : storageKey,
                Body        : fileContent,
                ContentType : mimeType
            };

            const command = new PutObjectCommand(params);
            const response = await s3.send(command);
            logger.info(`File uploaded successfully. ${JSON.stringify(response, null, 2)}`);
            return storageKey;
        } catch (err) {
            logger.error(err);
        }
    };

    public getStoragePathFromCloudFrontPath = (cloudFrontPath: string, filename: string) => {
        if (!cloudFrontPath) {
            return filename;
        }
        const tokens = cloudFrontPath.split("/");
        if (tokens.length < 4) {
            return filename;
        }
        var storagePath = tokens[3]  + "/" + filename;
        return storagePath;
    };

    public signUrl_CloudFront = async (url: string) => {
        try {
            const expiryDuration_mils = parseInt(this._tenantEnvProvider.getTenantEnvironmentVariable('EXPIRE_LINK_TIME'));
            const expiryDuration_secs = expiryDuration_mils / 1000;
            var dateLessThan_ = TimeUtils.addDuration(new Date(), expiryDuration_secs, DurationType.Second);
            dateLessThan_ = TimeUtils.addDuration(dateLessThan_, 1, DurationType.Day); //Add 1 day to be on the safe side
            const dateLessThan = TimeUtils.formatDate(dateLessThan_);
            const keyPairId = process.env.CF_KEY_PAIR_ID;
            const privateKey = process.env.CF_PRIVATE_KEY;
            const signedUrl = cfSigner.getSignedUrl({
                url,
                keyPairId,
                dateLessThan,
                privateKey,
            });
            return signedUrl;
        } catch (err) {
            logger.error(err);
        }
    };

    public exists = async (storageKey: string): Promise<string> => {
        try {
            const creds = await this.getCrossAccountCredentials();
            const s3 = new S3Client(creds);
            const params = {
                Bucket : process.env.BUCKET_NAME,
                Key    : storageKey,
            };
            const command = new HeadObjectCommand(params);
            const result = await s3.send(command);
            logger.info(JSON.stringify(result, null, 2));

            if (result.$metadata.httpStatusCode <= 204) {
                return null;
            }
            return storageKey;
        }
        catch (error) {
            logger.info(JSON.stringify(error, null, 2));
            return null;
        }
    };

    public uploadStream = async (storageKey: string, stream: Readable): Promise<string> => {
        try {
            const creds = await this.getCrossAccountCredentials();
            const s3 = new S3Client(creds);
            const params = {
                Bucket : process.env.BUCKET_NAME,
                Key    : storageKey,
                Body   : stream.read()
            };
            const command = new PutObjectCommand(params);
            const response = await s3.send(command);

            logger.info(JSON.stringify(response, null, 2));

            return storageKey;
        }
        catch (error) {
            logger.info(error.message);
            return null;
        }
    };

    public uploadFromUrl = async (fileUrl: string, storageKeyPath:string): Promise<string> => {
        try {
            http.get(fileUrl, async (res) => {
                const filename = path.basename(fileUrl);
                const storageKey_ = path.join(storageKeyPath, filename);
                const storageKey = await this.uploadStream(storageKey_, res);
                return storageKey;
            });
        }
        catch (error) {
            logger.info(error.message);
            return null;
        }
    };

    public upload = async (storageKey: string, localFilePath?: string): Promise<string> => {
        try {
            const fileContent = fs.readFileSync(localFilePath);
            const creds = await this.getCrossAccountCredentials();
            const s3 = new S3Client(creds);
            const params = {
                Bucket : process.env.BUCKET_NAME,
                Key    : storageKey,
                Body   : fileContent
            };

            const command = new PutObjectCommand(params);
            const response = await s3.send(command);

            logger.info(JSON.stringify(response, null, 2));

            return storageKey;
        }
        catch (error) {
            logger.info(error.message);
        }
    };

    public download = async (storageKey: string, localFilePath: string): Promise<string> => {
        try {
            const creds = await this.getCrossAccountCredentials();
            const s3 = new S3Client(creds);
            const params = {
                Bucket : process.env.BUCKET_NAME,
                Key    : storageKey,
            };

            const file = fs.createWriteStream(localFilePath);
            const command = new GetObjectCommand(params);
            const response = await s3.send(command);
            const stream = response.Body as Readable;
            return new Promise((resolve, reject) => {
                stream.on('end', () => {
                    var stats = fs.statSync(localFilePath);
                    var count = 0;
                    while (stats.size === 0 && count < 5) {
                        setTimeout(() => {
                            stats = fs.statSync(localFilePath);
                        }, 3000);
                        count++;
                    }
                    return resolve(localFilePath);
                }).on('error', (error) => {
                    return reject(error);
                }).pipe(file);
            });
        }
        catch (error) {
            logger.info(error.message);
            return null;
        }
    };

    public getBytesFromS3File = (awsS3StorageKey: string) => {
        const bytes = new Promise<Buffer>((resolve, reject) => {
            const audioBytes = [];
            this.getS3FileDataAsReadable(awsS3StorageKey)
                .then((readable) => {
                    readable.on('data', (data) => {
                        audioBytes.push(data);
                    });
                    readable.on('end', async () => {
                        resolve(Buffer.concat(audioBytes));
                    });
                    readable.on('error', (err) => {
                        reject(err);
                    });
                });
        });
        return bytes;
    };

    public rename = async (storageKey: string, newFileName: string): Promise<boolean> => {
        try {
            const creds = await this.getCrossAccountCredentials();
            const s3 = new S3Client(creds);
            var s3Path = storageKey;
            var tokens = s3Path.split('/');
            var existingFileName = tokens[tokens.length - 1];
            var newPath = s3Path.replace(existingFileName, newFileName);
            if (newPath === s3Path){
                throw new Error('Old and new file identifiers are same!');
            }

            var BUCKET_NAME = process.env.BUCKET_NAME;
            var OLD_KEY = s3Path;
            var NEW_KEY = newPath;

            const params = {
                Bucket     : BUCKET_NAME,
                CopySource : `${BUCKET_NAME}/${OLD_KEY}`,
                Key        : NEW_KEY
            };

            // copy object
            const copyCommand = new CopyObjectCommand(params);
            await s3.send(copyCommand);

            // delete old object
            const deleteCommand = new DeleteObjectCommand({
                Bucket : BUCKET_NAME,
                Key    : OLD_KEY
            });
            await s3.send(deleteCommand);

            return true;
        }
        catch (error) {
            logger.info(error.message);
            return false;
        }
    };

    public delete = async (storageKey: string): Promise<boolean> => {
        try {
            const creds = await this.getCrossAccountCredentials();
            const s3 = new S3Client(creds);
            const params = {
                Bucket : process.env.BUCKET_NAME,
                Key    : storageKey
            };

            const command = new DeleteObjectCommand(params);
            const result = await s3.send(command);
            logger.info(`Delete result from S3: ${JSON.stringify(result)}`);
            if (result.$metadata.httpStatusCode !== 204) {
                return false;
            }
            return true;
        }
        catch (error) {
            logger.info(error.message);
            return false;
        }
    };

    public getShareableLink_S3 = async (storageKey: string, durationInMinutes: number): Promise<string> => {
        try {
            const creds = await this.getCrossAccountCredentials();
            const s3 = new S3Client(creds);
            const getObjectParams = { Bucket: process.env.BUCKET_NAME, Key: storageKey };
            const command = new GetObjectCommand(getObjectParams);
            const url = await s3Signer.getSignedUrl(s3, command, { expiresIn: durationInMinutes * 60 });

            return url;
        }
        catch (error) {
            logger.info(error.message);
            return null;
        }
    };

}
