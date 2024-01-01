import { PromptTemplate } from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { CommaSeparatedListOutputParser } from "langchain/schema/output_parser";
import { inject, Lifecycle, scoped } from 'tsyringe';
import { Imessage, OutgoingMessage } from "../../refactor/interface/message.interface";
import { FeedbackHandler } from '../../message.handlers/feedback/feedback.handler';
import { ChatMessage } from "../../models/chat.message.model";
import { EntityManagerProvider } from "../entity.manager.provider.service";
const dialogflow = require('@google-cloud/dialogflow');
import { MessageHandlerType, NlpProviderType, UserFeedbackType, ChannelType } from "../../domain.types/enums";
import { EmojiFilter } from "../filter.message.for.emoji.service";
import { DialogflowResponseService } from '../dialogflow.response.service';
import { logger } from '../../logger/logger';
import { TenantEnvironmentProvider } from "../../auth/tenant.environment/tenant.environment.provider";
import { AssessmentHandler } from "../../message.handlers/assessment/assessments.handler";

///////////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class DecisionRouter {

    outgoingMessage!: OutgoingMessage;

    constructor(
        @inject(DialogflowResponseService) private dialogflowResponseService?: DialogflowResponseService,
        @inject(FeedbackHandler) private _feedbackHandler?: FeedbackHandler,
        @inject(AssessmentHandler) private _assessmentHandler?: AssessmentHandler,
        @inject(EntityManagerProvider) private entityManagerProvider?: EntityManagerProvider,
        @inject(TenantEnvironmentProvider) private _tenantEnvProvider?: TenantEnvironmentProvider,
        @inject(EmojiFilter) private emojiFilter?: EmojiFilter
    ){
        // this.outgoingMessage = {
        //     PrimaryMessageHandler : MessageHandlerType.Unhandled,
        //     MetaData              : {
        //         name              : "",
        //         platform          : "",
        //         platformId        : "",
        //         chat_message_id   : "",
        //         direction         : "",
        //         type              : "",
        //         messageBody       : "",
        //         imageUrl          : "",
        //         latlong           : "",
        //         replyPath         : "",
        //         intent            : "",
        //         responseMessageID : "",
        //         contextId         : ""
        //     },
        //     Intent : {
        //         NLPProvider : NlpProviderType.LLM,
        //         IntentName  : ''
        //     },
        //     Assessment : {
        //         AssessmentId   : '',
        //         AssessmentName : '',
        //         TemplateId     : ''
        //     },
        //     QnA : {
        //         NLPProvider : NlpProviderType.LLM,
        //         UserQuery   : ''
        //     },
        //     Feedback : {

        //     }

        // };
    }

    public model = new ChatOpenAI({ temperature: 0, modelName: "gpt-3.5-turbo" });

    public feedbackFlag = false;

    public assessmentFlag = false;

    public intentFlag = false;

    async checkDFIntent(messageBody: Imessage){

        // Get matching intents with score for dialogflow
        // const userId = messageBody.platformId === null ? v4() : messageBody.platformId;
        // let options = {};
        // const dfGCPCredentials = JSON.parse(this.clientEnvironmentProviderService.getClientEnvironmentVariable('DIALOGFLOW_BOT_GCP_PROJECT_CREDENTIALS'));
        // const GCPCredenctials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        // const dfAppCredentialsObj = dfGCPCredentials ? dfGCPCredentials : GCPCredenctials;

        // options = {
        //     credentials : {
        //         client_email : dfAppCredentialsObj.client_email,
        //         private_key  : dfAppCredentialsObj.private_key,
        //     },
        //     projectId : dfAppCredentialsObj.project_id
        // };
        // const projectIdFinal = this.clientEnvironmentProviderService.getClientEnvironmentVariable("DIALOGFLOW_PROJECT_ID");

        // const sessionClient = new dialogflow.SessionsClient(options);
        // const sessionPath = sessionClient.projectAgentSessionPath(projectIdFinal, userId);
        // const dialogflowLanguage = await this.getDialogflowLanguage();
        // const requestBody = {
        //     session    : sessionPath,
        //     queryInput : {
        //         text : {
        //             text         : messageBody.messageBody,
        //             languageCode : dialogflowLanguage
        //         }
        //     }
        // };

        // const dfResponse = await sessionClient.detectIntent(requestBody);
        const dfResponse = await this.dialogflowResponseService.getDialogflowMessage(messageBody.messageBody, messageBody.platform, messageBody.intent, messageBody);
        const responses = dfResponse.getResponses();
        for (const key in responses){
            logger.info(responses[key]);
            if (responses[key] !== null){
                const confidence = responses[key].queryResult.intentDetectionConfidence;
                const intent = responses[key].queryResult.intent.displayName;
                if (confidence > 0.85 && intent !== "Default Fallback Intent") {
                    this.intentFlag = true;
                }
            }
        }
        return dfResponse;
    }

    async getDecision(messageBody: Imessage, channel: string){
        try {
            const resultFeedback = await this._feedbackHandler.checkFeedback(messageBody);
            this.outgoingMessage.MetaData = messageBody;
            if (!resultFeedback.feedbackFlag){
                const resultAssessment = await this._assessmentHandler.checkAssessment(messageBody, channel);
                if (!resultAssessment){
                    const resultIntent = await this.checkDFIntent(messageBody);
                    if (!this.intentFlag){
                        logger.info("All functions returned false");
                        this.outgoingMessage.PrimaryMessageHandler = MessageHandlerType.QnA;
                        return this.outgoingMessage;
                    } else {
                        logger.info('At least one function returned true');
                        this.outgoingMessage.PrimaryMessageHandler = MessageHandlerType.NLP;
                        this.outgoingMessage.Intent = {
                            NLPProvider   : NlpProviderType.Dialogflow,
                            IntentName    : resultIntent.getIntent(),
                            Confidence    : resultIntent.getConfidenceScore(),
                            IntentContent : resultIntent
                        };
                        return this.outgoingMessage;
                    }
                } else {
                    logger.info('Skipping intent due to assessment returning true');
                    this.outgoingMessage.PrimaryMessageHandler = MessageHandlerType.Assessments;
                    this.outgoingMessage.Assessment = {
                        AssessmentId   : '123',
                        AssessmentName : 'Test',
                        TemplateId     : '111'
                    };
                    return this.outgoingMessage;
                }
            } else {
                logger.info('Skipping assessment and intent due to feedback returning true');

                // this.outgoingMessage.Feedback.FeedbackType = resultFeedback.feedbackType;
                this.outgoingMessage.PrimaryMessageHandler = MessageHandlerType.Feedback;
                this.outgoingMessage.Feedback = {
                    FeedbackContent : resultFeedback.messageContent,
                    SupportHandler  : {
                        SupportTaskId : '',
                        Channel       : ChannelType.Clickup
                    }
                };
                return this.outgoingMessage;
            }
        } catch (error) {
            logger.error('Error in router:', error);
        }
    }

    async getDialogflowLanguage(){
        if (this.clientEnvironmentProviderService.getClientEnvironmentVariable("DIALOGFLOW_DEFAULT_LANGUAGE_CODE")){
            return this.clientEnvironmentProviderService.getClientEnvironmentVariable("DIALOGFLOW_DEFAULT_LANGUAGE_CODE");
        }
        else {
            return "en-US";
        }
    }

}
