import express from "express";
import { ChatMessageService } from "../../../../database/typeorm/services/chat.message.service";
import { ChatMessageResponseDto } from "../../../../types/domain.models/chat.message.domain.models";
import { logger } from "../../../../logger/logger";
import { Acknowledgement } from "../../../../types/common.types";

//////////////////////////////////////////////////////////////////////////////

export const updateMessageTimestamp = async (
    request: express.Request,
    channelMessageId: any,
    date: Date,
    status: string) => {

    const chatMessageService: ChatMessageService = request.container.resolve("ChatMessageService");
    const chatMessage: ChatMessageResponseDto = await chatMessageService.getByChannelMessageId(channelMessageId);
    if (chatMessage === null) {
        logger.error(`Message with channel message ID ${channelMessageId} not found`);
    }
    const channelDetails = chatMessage.ChannelSpecifics;
    if (status === 'sent') {
        channelDetails.SentTimestamp = date;
    }
    else if (status === 'delivered') {
        channelDetails.DeliveredTimestamp = date;
    }
    else if (status === 'read') {
        channelDetails.ReadTimestamp = date;
    }
    else {
        logger.error(`Invalid status ${status}`);
    }
    channelDetails.SentTimestamp = date;
    const channelMessageStr = JSON.stringify(channelDetails);
    const updated = await chatMessageService.update(
        chatMessage.id,
        {
            ChannelSpecifics : channelMessageStr
        }
    );
    if (updated === null) {
        logger.error(`Failed to update message with channel message ID ${channelMessageId}`);
    }
};

export const updateAcknowledgement = async (
    statuses: any,
    ack: Acknowledgement,
    request): Promise<Acknowledgement> => {

    const statusObj = statuses[0];
    const channelMessageId = statusObj.id;
    const date = new Date(parseInt(statusObj.timestamp) * 1000);
    ack.ShouldAcknowledge = true;
    ack.StatusCode = 200;
    if (statusObj.status === "sent") {
        ack.Message = 'Message sent successfully!';
        await updateMessageTimestamp(request, channelMessageId, date, 'sent');
    }
    else if (statusObj.status === "delivered") {
        ack.Message = 'Message delivered successfully!';
        await updateMessageTimestamp(request, channelMessageId, date, 'delivered');
    }
    else if (statusObj.status === "read") {
        ack.Message = 'Message read successfully!';
        await updateMessageTimestamp(request, channelMessageId, date, 'read');
    }
    else {
        ack.Message = 'Notification received successfully!';
    }
    return ack;
};
