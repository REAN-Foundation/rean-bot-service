import { ChannelType, MessageContentType } from "./enums";
import { MessageHandlerType } from "./enums/message.handler.enum";
import { uuid } from "./miscellaneous/system.types";
import { Language } from "./language";

////////////////////////////////////////////////////////////////////////////////

export interface MessageChannelDetails {
    Channel                  : ChannelType;
    ChannelUserId           ?: string;
    ChannelMessageId        ?: string;
    ChannelResponseMessageId?: string;
    SupportTaskId           ?: string; // for support channels
}

export interface GeoLocation {
    Latitude ?: number;
    Longitude?: number;
    Country  ?: string;
    State    ?: string;
    City     ?: string;
}

export interface Message {
    id                      ?: uuid;
    TenantId                ?: uuid;
    TenantName               : string;
    UserId                   : uuid;
    Channel                  : ChannelType;
    MessageType              : MessageContentType;
    SessionId               ?: uuid;
    Language                ?: Language;
    MessageContent          ?: string | unknown;
    ImageContent            ?: string;
    ImageUrl                ?: string;
    OriginLocation          ?: GeoLocation;
    ChannelDetails          ?: MessageChannelDetails;
    SentTimestamp            : Date;
    Metadata                ?: Record<string, unknown>;
    PrevHistory             ?: Message[];
}

export interface IncomingMessage extends Message {
    PrevOutgoingMessageId   ?: uuid;
    IdentifiedIntent         : string;
    IsFeedbackMessage       ?: boolean;
    Feedback                 : any;
}

export interface OutgoingMessage extends Message {
    PrevIncomingMessageId   ?: uuid;
    PrimaryMessageHandler    : MessageHandlerType;
    HumanHandoff             : boolean;
    SupportChannel          ?: MessageChannelDetails;
}
