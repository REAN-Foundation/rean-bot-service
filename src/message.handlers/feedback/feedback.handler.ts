import { Lifecycle, scoped, inject } from 'tsyringe';
import { UserFeedbackType } from '../../domain.types/enums';
import { ProcessableMessage } from '../../domain.types/common.types';
import { logger } from '../../logger/logger';
import { IMessageHandler } from '../message.handler.interface';
import { TenantEnvironmentProvider } from '../../auth/tenant.environment/tenant.environment.provider';
import { EmojiFilter } from '../../services/emoji.filter';

//////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class FeedbackHandler implements IMessageHandler {

    constructor(
        @inject('TenantEnvironmentProvider') private _tenantEnvProvider?: TenantEnvironmentProvider,
        @inject(EmojiFilter) private _emojiFilter?: EmojiFilter
    ) {

    }

    public async handle(message: ProcessableMessage): Promise<ProcessableMessage> {
        logger.info('FeedbackHandler.handle');
        logger.info(JSON.stringify(message, null, 2));
        return null;
    }

    // Check if message is feedback or not
    public async checkFeedback(message: ProcessableMessage): Promise<any> {

        let feedbackType = UserFeedbackType.None;
        let flag = false;
        let feedback = '';
        if (message.PrevContextMessageId){
            flag = true;
            feedbackType = UserFeedbackType.None;
            feedback = message.Content;
        } else {
            feedback = await this._emojiFilter.checkForEmoji(message.Content);
            if (feedback === 'PositiveFeedback'){
                feedbackType = UserFeedbackType.Positive;
                flag = true;
            } else if (feedback === 'NegativeFeedback') {
                feedbackType = UserFeedbackType.Negative;
                flag = true;
            }
        }
        const feedbackObj = {
            feedbackType   : feedbackType,
            feedbackFlag   : flag,
            messageContent : feedback
        };
        return feedbackObj;
    }

}
