/* eslint-disable @typescript-eslint/no-unused-vars */
import speech from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';
import util from 'util';
import fs from 'fs';
import crypto from 'crypto';
import { ISpeechService } from '../speech.interface';
import { TenantEnvironmentProvider } from '../../../auth/tenant.environment/tenant.environment.provider';
import { Lifecycle, inject, scoped } from 'tsyringe';
import { AwsManager } from '../../../integrations/aws/aws.manager';
import { logger } from '../../../logger/logger';

////////////////////////////////////////////////////////////////////////////////
type AudioEncoding = "OGG_OPUS" | "MP3" | "AUDIO_ENCODING_UNSPECIFIED" | "LINEAR16" | "MULAW" | "ALAW";
type SSMLGender = "MALE" | "FEMALE" | "NEUTRAL";
////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class GcpSpeechService implements ISpeechService {

    private _options = null;

    constructor(
        @inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider,
        @inject('TenantName') private _tenantName?: string,
        @inject(AwsManager) private _awsManager?: AwsManager
    ) {
        const gcpCreds = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        this._options = {
            credentials : gcpCreds,
            projectId   : gcpCreds.project_id
        };
    }

    public speechToText = async (
        buffer: Buffer,
        mediaType: string,
        preferredLanguage: string
    ): Promise<string> => {
        try {
            // Usage: please use the following code snippet to get the buffer from S3
            // var buffer = await this.getBytesFromS3File(awsS3StorageKey);
            // var extension = path.extname(awsS3StorageKey);
            // var mimeType = Helper.getMimeType(extension);

            const audioBytes_ = buffer.toString('base64');
            const audio = {
                content : audioBytes_,
            };
            const sampleRate = mediaType === '.oga' ? 48000 : 16000;
            const config = {
                encoding                            : 'OGG_OPUS',
                sampleRateHertz                     : sampleRate,
                languageCode                        : preferredLanguage ?? 'en-US',
                enableSeparateRecognitionPerChannel : true,
            };
            let request = {};
            request = {
                audio  : audio,
                config : config,
            };

            const gcpCred = this._options;
            const client = new speech.SpeechClient(gcpCred);

            const [response] = await client.recognize(request);
            const transcription = response.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');
            logger.info(`Transcription: ${transcription}`);
            return transcription;
        } catch (error) {
            logger.error(error);
            return null;
        }
    };

    public async textToSpeech(
        text: string,
        mediaType: string = '.mp3',
        preferredLanguage: string = 'en-US'): Promise<string> {

        try {
            const gcpCred = this._options;
            const client = new textToSpeech.TextToSpeechClient(gcpCred);
            const lang = preferredLanguage ? preferredLanguage : 'en-US';
            const encoding: AudioEncoding = mediaType === '.oga' ? 'OGG_OPUS' : 'MP3';
            const ssmlGender: SSMLGender = "FEMALE";
            const request = {
                input : {
                    text : text
                },
                // Select the language and SSML voice gender (optional)
                voice : {
                    languageCode : lang,
                    name         : 'en-US-Standard-B',
                    ssmlGender   : ssmlGender
                },
                // select the type of audio encoding
                audioConfig : {
                    audioEncoding : encoding
                },
            };
            const [response] = await client.synthesizeSpeech(request);
            const writeFile = util.promisify(fs.writeFile);
            //TODO: Please use temp folder instead of audio folder.
            //We clean-up temp folder every 5 minutes of older files.
            const filename = './audio/output_' + crypto.randomBytes(16).toString('hex') + mediaType;
            await writeFile(filename, response.audioContent, 'binary');
            return filename;
        }
        catch (error) {
            logger.info(error);
        }

    }

}
