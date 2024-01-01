import { Lifecycle, inject, scoped } from 'tsyringe';
import { ProcessableMessage, SerializableMessage } from '../../../domain.types/common.types';
import { logger } from '../../../logger/logger';
import { INLPHandler } from '../nlp.handler.interface';
import { Intent } from '../../../intent/intent.emitter';
import { TenantEnvironmentProvider } from '../../../auth/tenant.environment/tenant.environment.provider';
import pbUtils = require('pb-util');
import dialogflow from '@google-cloud/dialogflow';
import { v4 } from 'uuid';
import { DialogFlowOutMessage } from './dialogflow.out.message';
import { IntentDto } from '../nlp.out.message';

//////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class DialogFlowHandler implements INLPHandler {

    constructor(
        @inject('TenantName') private _tenantName?: string,
        @inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider
    ) {}

    public language(): string {
        if (this._tenantEnvProvider.getTenantEnvironmentVariable("DIALOGFLOW_DEFAULT_LANGUAGE_CODE")){
            return this._tenantEnvProvider.getTenantEnvironmentVariable("DIALOGFLOW_DEFAULT_LANGUAGE_CODE");
        }
        else {
            return "en-US";
        }
    }

    public extractIntentFromReqBody(requestBody: any): Intent {
        const message = new DialogFlowOutMessage([requestBody]);
        return message.getIntent();
    }

    public identifyIntent = async (message: ProcessableMessage): Promise<IntentDto> => {
        try {
            const dialogflowLanguage = this.language();

            const userId: string = message.UserId === null ? v4() : message.UserId;
            const userName = message.ChannelUser.FirstName + " " + message.ChannelUser.LastName;
            const { sessionPath, sessionClient } = this.getCredentials(userId);
            const messagePayload = this.getMessagePayload(message);

            //Ref: https://cloud.google.com/dialogflow/es/docs/reference/rest/v2/projects.agent.sessions/detectIntent
            const requestBody = this.getReqBody(
                sessionPath,
                message,
                dialogflowLanguage,
                userId,
                userName,
                messagePayload);

            return await this.getDialogFlowResponse(sessionClient, requestBody);
        }
        catch (error) {
            logger.error(JSON.stringify(error, null, 2));
        }
    };

    public identifyIntentFromMessage = async (message: ProcessableMessage, intent: Intent): Promise<IntentDto> => {
        try {
            const dialogflowLanguage = this.language();
            const userId: string = message.UserId === null ? v4() : message.UserId;
            const userName = message.ChannelUser.FirstName + " " + message.ChannelUser.LastName;
            const { sessionPath, sessionClient } = this.getCredentials(userId);
            const messagePayload = this.getMessagePayload(message);

            const requestBody = this.getReqBodyWithIntent(
                sessionPath,
                intent,
                dialogflowLanguage,
                message,
                userId,
                userName,
                messagePayload);

            return await this.getDialogFlowResponse(sessionClient, requestBody);
        }
        catch (error) {
            logger.error(JSON.stringify(error, null, 2));
        }
    };

    private async getDialogFlowResponse(sessionClient: any, requestBody: any) {
        const responses = await sessionClient.detectIntent(requestBody);

        const outMessage = new DialogFlowOutMessage(responses);
        const intentfromDF = outMessage.getIntent();
        logger.info(`Identified Intent : ${intentfromDF}`);

        const intentDto: IntentDto = {
            Intent     : intentfromDF,
            Confidence : 0,
            Entities   : [],
            Payload    : outMessage
        };
        return intentDto;
    }

    private getReqBody(sessionPath: any, message: SerializableMessage, dialogflowLanguage: string, userId: string, userName: string, messagePayload: { TenantId: string; TenantName: string; UserId: string; ChannelUser: string; Channel: import("d:/current_projects/rean/code/rean-bot-service/src/domain.types/enums/channel.type.enum").ChannelType; ChannelMessageId: string; MessageType: import("d:/current_projects/rean/code/rean-bot-service/src/domain.types/enums/message.content.type.enum").MessageContentType; Direction: import("d:/current_projects/rean/code/rean-bot-service/src/domain.types/enums/message.direction.enum").MessageDirection; SessionId: string; Content: string; Timestamp: string; PrevContextMessageId: string; }) {
        return {
            session    : sessionPath,
            queryInput : {
                text : {
                    text         : message.Content.toString(),
                    languageCode : dialogflowLanguage,
                },
            },
            queryParams : {
                payload : pbUtils.struct.encode(
                    {
                        source   : message.Channel,
                        userId   : userId,
                        userName : userName,
                        location : {
                            latitude  : message.GeoLocation.Latitude,
                            longitude : message.GeoLocation.Longitude
                        },
                        contextId       : message.ChannelSpecifics.ReferenceMessageId,
                        completeMessage : messagePayload
                    })
            },
        };
    }

    private getReqBodyWithIntent(
        sessionPath: any,
        intent: string,
        dialogflowLanguage: string,
        message: SerializableMessage,
        userId: string,
        userName: string,
        messagePayload: any) {
        const requestBody = {
            session    : sessionPath,
            queryInput : {
                event : {
                    name         : intent,
                    languageCode : dialogflowLanguage,
                },
            },
            queryParams : {
                payload : pbUtils.struct.encode(
                    {
                        source   : message.Channel,
                        userId   : userId,
                        userName : userName,
                        location : {
                            latitude  : message.GeoLocation.Latitude,
                            longitude : message.GeoLocation.Longitude
                        },
                        contextId       : message.ChannelSpecifics.ReferenceMessageId,
                        completeMessage : messagePayload
                    })
            },
        };
        return requestBody;
    }

    private getMessagePayload(message: SerializableMessage) {
        return {
            TenantId             : message.TenantId,
            TenantName           : message.TenantName,
            UserId               : message.UserId,
            ChannelUser          : message.ChannelUser.ChannelUserId,
            Channel              : message.Channel,
            ChannelMessageId     : message.ChannelMessageId,
            MessageType          : message.MessageType,
            Direction            : message.Direction,
            SessionId            : message.SessionId,
            Content              : message.Content ? message.Content.toString() : null,
            Timestamp            : message.Timestamp?.toISOString(),
            PrevContextMessageId : message.PrevContextMessageId,
        };
    }

    private getCredentials(userId: string) {

        let sessionClient = null;
        let sessionPath = null;
        let options = {};
        let projectIdFinal = null;

        const botGCPCreds = JSON.parse(this._tenantEnvProvider.getTenantEnvironmentVariable("DIALOGFLOW_BOT_GCP_PROJECT_CREDENTIALS"));
        const gcpCreds = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        const creds = botGCPCreds ? botGCPCreds : gcpCreds;
        options = {
            credentials : {
                client_email : creds.client_email,
                private_key  : creds.private_key
            },
            projectId : creds.private_key
        };
        projectIdFinal = this._tenantEnvProvider.getTenantEnvironmentVariable("DIALOGFLOW_PROJECT_ID");

        sessionClient = new dialogflow.SessionsClient(options);
        sessionPath = sessionClient.projectAgentSessionPath(projectIdFinal, userId);
        return { sessionPath, sessionClient };
    }

    public async handle(message: ProcessableMessage): Promise<ProcessableMessage> {
        logger.info('DialogFlowHandler.handle');
        logger.info(JSON.stringify(message, null, 2));
        return null;
    }

}
