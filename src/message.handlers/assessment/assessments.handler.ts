import { logger } from "../../logger/logger";
import { ProcessableMessage } from "../../types/common.types";
import { IMessageHandler } from "../message.handler.interface";
import { channel } from "diagnostics_channel";
import { TenantEnvironmentProvider } from "../../auth/tenant.environment/tenant.environment.provider";
import { ChatMessage } from "../../database/typeorm/models/chat.message.entity";
import { scoped, Lifecycle, inject } from "tsyringe";
import { ChatMessageService } from "../../database/typeorm/services/chat.message.service";
import { SessionService } from "../../database/typeorm/services/session.service";
import { AssessmentService } from "../../database/typeorm/services/assessment.service";

//////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class AssessmentHandler implements IMessageHandler {

    constructor(
        @inject('TenantEnvironmentProvider') private _tenantEnvProvider?: TenantEnvironmentProvider,
        @inject(ChatMessageService) private _chatMessageService?: ChatMessageService,
        @inject(SessionService) private _sessionService?: SessionService,
        @inject(AssessmentService) private _assessmentService?: AssessmentService,
    ) {

    }

    public handle = async (message: ProcessableMessage): Promise<ProcessableMessage> => {
        logger.info('AssessmentHandler.handle');
        logger.info(JSON.stringify(message, null, 2));
        return null;
    };

    public checkAssessment = async (message: ProcessableMessage): Promise<any> => {
        try {

            // Check if message is part of assessment
            const chatSessionRepository = (
                await this.entityManagerProvider.getEntityManager(this.clientEnvironmentProviderService)).getRepository(ChatMessage);
            const lastBotMessage = await chatSessionRepository.findOne({
                where : {
                    userPlatformId : messageBody.platformId,
                    platform       : channel
                },
                order : [ [ 'createdAt', 'DESC' ] ]
            });
            const lastMessage = await chatSessionRepository.findOne({
                where : {
                    userPlatformId : messageBody.platformId,
                    platform       : channel
                },
                order : [ [ 'createdAt', 'DESC'] ]
            });

            const assessmentInProgress = lastBotMessage.messageFlag;
            this.assessmentFlag = ( assessmentInProgress === 'assessment' ) ? true : false;

            // Implement further logic for checking if assessment.

            return this.assessmentFlag;
        }
        catch (error) {
            logger.error(JSON.stringify(error, null, 2));
            return false;
        }

    };

}

