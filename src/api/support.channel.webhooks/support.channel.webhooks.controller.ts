/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import { ResponseHandler } from '../../common/handlers/response.handler';
import { Lifecycle, scoped } from 'tsyringe';
import { TenantEnvironmentProvider } from '../../auth/tenant.environment/tenant.environment.provider';
import { IChannel } from '../../channels/channel.interface';
import { ChatMessageService } from '../../database/typeorm/services/chat.message.service';
import { SessionService } from '../../database/typeorm/services/session.service';
import { UserService } from '../../database/typeorm/services/user.service';
import MessageProcessQueue from '../../message.pipelines/process.queue/message.process.queue';
import { InMessageMetadata } from '../../domain.types/intermediate.data.types';

///////////////////////////////////////////////////////////////////////////////////////

@scoped(Lifecycle.ContainerScoped)
export class SupportChannelWebhookController {

    receiveMessage = async (request: express.Request, response: express.Response) => {
        try {
            const channelName = request.params.channel;
            const tenantName = request.params.client;
            const container = request.container;

            //Register tenant name as a dependency
            container.register("TenantName", { useValue: tenantName });
            container.register("ChannelName", { useValue: channelName });

            const envProvider = container.resolve(TenantEnvironmentProvider);
            const tenantId = envProvider.getTenantEnvironmentVariable('TENANT_ID');
            const channel = container.resolve(`IChannel`) as IChannel;

            //1. Authenticate with channel
            await channel.webhookAuthenticator().authenticate(request);

            const messageBody: InMessageMetadata = {
                Container   : container,
                RequestBody : request.body,
                Channel     : channel,
                ChannelName : channelName,
                TenantName  : tenantName,
                TenantId    : tenantId,
            };

            //2. Enqueue message for processing
            MessageProcessQueue.enqueue(messageBody);

            //3. Check if this message is related to acknowledgement of a message sent
            const ack = await channel.shouldAcknowledge(request);
            if (ack?.ShouldAcknowledge === true) {
                return channel.acknowledge(request, response, ack);
            }

            return ResponseHandler.success(request, response, 'Message received successfully!', 200, null);

        } catch (error) {
            ResponseHandler.handleError(request, response, error);
        }
    };

}
