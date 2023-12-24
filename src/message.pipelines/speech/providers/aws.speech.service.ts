
import AWS from 'aws-sdk';
import fs from 'fs';
import crypto from 'crypto';
import { ISpeechService } from '../speech.interface';
import { TenantEnvironmentProvider } from '../../../auth/tenant.environment/tenant.environment.provider';
import { Lifecycle, inject, scoped } from 'tsyringe';
import { AwsManager } from '../../../integrations/aws/aws.manager';
import { logger } from '../../../logger/logger';
import { LanguageCode, MediaFormat, StartTranscriptionJobCommandOutput, TranscribeClient } from "@aws-sdk/client-transcribe";
import { StartTranscriptionJobCommand } from "@aws-sdk/client-transcribe";

////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class AwsSpeechService implements ISpeechService {

    constructor(
        @inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider,
        @inject('TenantName') private _tenantName?: string,
        @inject(AwsManager) private _awsManager?: AwsManager
    ) {
    }

    private getPolly(creds: any): AWS.Polly {
        const credObj = {
            region          : process.env.region,
            accessKeyId     : creds.accessKeyId,
            secretAccessKey : creds.secretAccessKey,
            sessionToken    : creds.sessionToken
        };
        const polly = new AWS.Polly(credObj);
        return polly;
    }

    private getTransciber(creds: any): TranscribeClient {
        const credObj = {
            region          : process.env.region,
            accessKeyId     : creds.accessKeyId,
            secretAccessKey : creds.secretAccessKey,
            sessionToken    : creds.sessionToken
        };
        const transcribeClient = new TranscribeClient(credObj);
        return transcribeClient;
    }

    public speechToText = async (
        audio: Buffer,
        mediaType: string = '.mp3',
        prefferedLanguage: string = 'en-US')
        : Promise<string> => {
        var transcribedText = '';
        try {
            const creds = await this._awsManager.getCrossAccountCredentials();
            const transcribeClient = await this.getTransciber(creds);
            const jobName = `transcription-${new Date().getTime().toFixed(0)}`;

            let fileUri = '';
            if (audio instanceof Buffer) {
                const base64Audio = audio.toString('base64');
                fileUri = `data:audio/mp3;base64,${base64Audio}`;
            }
            else {
                fileUri = audio;
            }
            const mediaFormat = mediaType === '.oga' ? MediaFormat.OGG : MediaFormat.MP3;
            const lang = prefferedLanguage ? prefferedLanguage : 'en-US';
            const params = {
                TranscriptionJobName : jobName,
                LanguageCode         : lang as LanguageCode,
                MediaFormat          : mediaFormat,
                Media                : {
                    MediaFileUri : fileUri,
                },
                OutputBucketName : process.env.BUCKET_NAME, //'bot-speech-to-text-transcriptions',
                OutputKey        : `${jobName}.json`,
            };
            const response: StartTranscriptionJobCommandOutput = await transcribeClient.send(
                new StartTranscriptionJobCommand(params)
            );
            if (response.TranscriptionJob.TranscriptionJobStatus === 'COMPLETED') {
                // Access the transcribed text
                transcribedText = response.TranscriptionJob.Transcript.TranscriptFileUri;
                // You might want to fetch the transcribed text file content or URL at this point
                logger.info(`Transcribed Text:', ${transcribedText}`);
            } else {
                logger.info('Transcription job is still in progress.');
            }
            return transcribedText;
        }
        catch (error) {
            logger.info(error);
        }
    };

    public async textToSpeech(text: string): Promise<string> {

        try {
            const creds = await this._awsManager.getCrossAccountCredentials();
            const polly = this.getPolly(creds);
            const params = {
                Engine       : 'neural',
                OutputFormat : 'mp3',
                Text         : text,
                TextType     : 'text',
                VoiceId      : 'Joanna',
            };
            const randomString = crypto.randomBytes(16).toString('hex');
            const res: Promise<string> = new Promise((resolve, reject) => {
                polly.synthesizeSpeech(params, async(error, data) => {
                    if (error) {
                        logger.error(error.message);
                        reject(error);
                    }
                    if (data.AudioStream instanceof Buffer) {
                        logger.info(`data: ${data}`);
                        const filename = './audio/' + randomString + '.mp3';
                        logger.info(`filename: ${filename}`);
                        fs.writeFile(filename, data.AudioStream, async(err) => {
                            if (err) {
                                logger.error(err.message);
                                reject(err);
                            }
                            logger.info('Success');
                            resolve(filename);
                        });
                    }
                });
            });

            const filename = (await res) as string;
            return filename;
        }
        catch (error) {
            logger.info(error);
        }

    }

}
