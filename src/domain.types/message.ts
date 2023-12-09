import { ChannelType, MessageContentType } from "./enums";
import { uuid } from "./miscellaneous/system.types";

////////////////////////////////////////////////////////////////////////////////

export interface Message {
    id                      ?: uuid;
    PrevIncomingMessageId   ?: uuid;
    PrevOutgoingMessageId   ?: uuid;
    TenantId                ?: uuid;
    TenantName               : string;
    UserId                   : uuid;
    Channel                  : ChannelType;
    SessionId                : uuid;
    MessageType              : MessageContentType;
    LanguageCode            ?: string;
    MessageContent          ?: string | unknown;
    ImageContent            ?: string;
    ImageUrl                ?: string;
    ChannelUserId           ?: string;
    ChannelMessageId        ?: string;
    ChannelResponseMessageId?: string;
    SentTimestamp            : Date;
    PrimaryMessageHandler    : string;
    Metadata                 : Record<string, unknown>;
}

export interface IncomingMessage extends Message {
    PrevIncomingMessageId   ?: uuid;
    PrevOutgoingMessageId   ?: uuid;
}

// export interface IncomingMessage {
//     id                      ?: uuid;
//     PrevOutgoingMessageId   ?: uuid;
//     TenantId                ?: uuid;
//     TenantName               : string;
//     UserId                   : uuid;
//     Channel                  : ChannelType;
//     SessionId                : uuid;
//     MessageType              : MessageContentType;
//     LanguageCode             : string;
//     MessageContent           : string | unknown;
//     ImageContent             : string;
//     ImageUrl                 : string;
//     ChannelUserId            : string;
//     ChannelMessageId         : string;
//     ChannelResponseMessageId : string;
//     SentTimestamp            : Date;
//     Metadata                 : Record<string, unknown>;
// }

export interface OutgoingMessage {
    id                       : uuid;
    PrevIncomingMessageId   ?: uuid;
    TenantId                ?: uuid;
    TenantName               : string;
    UserId                   : uuid;
    Channel                  : ChannelType;
    SessionId                : uuid;
    MessageType              : MessageContentType;
    LanguageCode             : string;
    MessageContent           : string | unknown;
    ImageContent             : string;
    ImageUrl                 : string;
    ChannelUserId            : string;
    ChannelMessageId         : string;
    ChannelResponseMessageId : string;
    SentTimestamp            : Date;
    PrimaryMessageHandler    : string;
    Metadata                 : Record<string, unknown>;
}
