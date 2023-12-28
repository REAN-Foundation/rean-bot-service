import { OutgoingMessage } from "../../domain.types/message";
import { ChannelType } from "../../domain.types/enums";
import { logger } from "../../logger/logger";
import { IChannel } from "../channel.interface";

////////////////////////////////////////////////////////////////////////////////

export class SupportChannelCommon {

    public static async sendSupportResponse(outChannel: IChannel, message: OutgoingMessage): Promise<any>
    {
        const outChannelType: ChannelType = outChannel.channelType();
        logger.info(`Sending support response to ${outChannelType}`);
        if (message.HumanHandoff === null || message.HumanHandoff === undefined) {
            logger.error(`HumanHandoff is null or undefined`);
            return false;
        }
        logger.info(JSON.stringify(message.HumanHandoff, null, 2));

        message.IsSupportResponse = true;
        message.Channel = outChannel.channelType();

        return await outChannel.send(message.ChannelUser.ChannelUserId, message);
    }

}
