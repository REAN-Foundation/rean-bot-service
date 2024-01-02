import { Lifecycle, inject, scoped } from 'tsyringe';
import { logger } from '../../logger/logger';
import { ChatMessageCreateModel, outgoingMessageToCreateModel } from '../../types/domain.models/chat.message.domain.models';
import { ProcessableMessage } from '../../types/common.types';
import MessageCache from '../../message.pipelines/cache/message.cache';
import { ChatMessageService } from '../../database/typeorm/services/chat.message.service';

//////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class OutMessageProcessor {

    constructor(
        @inject('TenantName') private _tenantName?: string,
    ) {}

    public async process(metadata, message: ProcessableMessage): Promise<any> {

        const container = metadata.container;
        const channel = metadata.channel;
        const channelUserId = metadata.channelUserId;
        // const channelType = metadata.channelType;
        // const tenantId = metadata.tenantId;
        // const tenantName = metadata.tenantName;
        const session = metadata.session;
        const messageConverter = channel.messageConverter();
        const dbChatMessageService = container.resolve(ChatMessageService);

        logger.info('OutMessageProcessor.process');
        logger.info(JSON.stringify(message, null, 2));

        message = await channel.processOutgoing(message);

        //11. Convert outgoing message to channel specific format
        const outgoingMessageToChannel = await messageConverter.toChannel(message);

        //12. Send the message to the channel
        const channelSendResponse = await channel.send(channelUserId, outgoingMessageToChannel);
        const outMessageCahnnelId = channelSendResponse.ChannelMessageId;
        message.ChannelMessageId = outMessageCahnnelId;

        //13. Store the outgoing message in the database
        const outCreateModel: ChatMessageCreateModel = outgoingMessageToCreateModel(message);
        const storedOutgoingMessage = await dbChatMessageService.create(outCreateModel);
        logger.info(`stored outmessage: ${JSON.stringify(storedOutgoingMessage, null, 2)}`);

        //14. Update the message cache with the outgoing message from user
        await MessageCache.addMessage(session.id, message);

        logger.info('MessageProcessQueue.processMessage: Message sent to channel');
        logger.info(JSON.stringify(channelSendResponse, null, 2));

        return channelSendResponse;
    }

}

